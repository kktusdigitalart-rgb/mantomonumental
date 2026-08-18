(() => {
  const cfg = window.MANTO_CONFIG || {};
  const PRICES = { Básico: Number(cfg.BASIC_PRICE || 65.00), Premium: Number(cfg.PREMIUM_PRICE || 85.00) };
  const COSTS = { Básico: Number(cfg.BASIC_COST || 55), Premium: Number(cfg.PREMIUM_COST || 70) };
  const form = document.querySelector('#order-form');
  const itemsContainer = document.querySelector('#items-container');
  const totalEl = document.querySelector('#order-total');
  const qtyEl = document.querySelector('#total-quantity');
  const msg = document.querySelector('#form-message');
  const brl = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const esc = s => String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let seq=0;

  function sizeOptions(category){
    return category==='Infantil' ? '<option>2</option><option>4</option><option>6</option><option>8</option><option>10</option><option>12</option><option>14</option><option>16</option>' : '<option>P</option><option>M</option><option>G</option><option>GG</option><option>XG</option><option>XGG</option>';
  }
  function addItem(model='Básico'){
    const el=document.createElement('article'); el.className='order-item'; el.dataset.id=++seq;
    el.innerHTML=`<div class="order-item-head"><b>Camisa <span class="item-number"></span></b><button type="button" class="remove-item" title="Remover">×</button></div><div class="item-grid">
      <div class="field"><label>Modelo *</label><select class="item-model"><option ${model==='Básico'?'selected':''}>Básico</option><option ${model==='Premium'?'selected':''}>Premium</option></select></div>
      <div class="field"><label>Categoria *</label><select class="item-category"><option selected>Masculino</option><option>Feminino</option><option>Infantil</option></select></div>
      <div class="field"><label class="size-label">Tamanho *</label><select class="item-size">${sizeOptions('Masculino')}</select></div>
      <div class="field child-age-field hidden"><label>Idade da criança *</label><input class="item-age" type="number" min="1" max="16" placeholder="Ex.: 8"></div>
      <div class="field"><label>Quantidade *</label><div class="qty-stepper"><button type="button" class="qty-minus">−</button><input class="item-qty" type="number" min="1" max="50" value="1"><button type="button" class="qty-plus">+</button></div></div>
      <div class="item-subtotal"><span>Subtotal</span><strong>${brl(PRICES[model])}</strong></div></div>`;
    itemsContainer.appendChild(el); bindItem(el); renumber(); updateTotal();
  }
  function bindItem(el){
    const model=el.querySelector('.item-model'), cat=el.querySelector('.item-category'), size=el.querySelector('.item-size'), ageWrap=el.querySelector('.child-age-field'), age=el.querySelector('.item-age'), qty=el.querySelector('.item-qty');
    model.onchange=updateTotal;
    cat.onchange=()=>{const child=cat.value==='Infantil';ageWrap.classList.toggle('hidden',!child);age.required=child;if(!child)age.value='';size.innerHTML=sizeOptions(cat.value);el.querySelector('.size-label').textContent=child?'Tamanho infantil *':'Tamanho *';updateTotal();};
    qty.oninput=()=>{if(+qty.value<1)qty.value=1;updateTotal();};
    el.querySelector('.qty-minus').onclick=()=>{qty.value=Math.max(1,+qty.value-1);updateTotal();};
    el.querySelector('.qty-plus').onclick=()=>{qty.value=Math.min(50,+qty.value+1);updateTotal();};
    el.querySelector('.remove-item').onclick=()=>{if(itemsContainer.children.length===1)return alert('O pedido precisa ter pelo menos uma camisa.');el.remove();renumber();updateTotal();};
  }
  function renumber(){[...itemsContainer.children].forEach((el,i)=>el.querySelector('.item-number').textContent=i+1);}
  function getItems(){return [...itemsContainer.querySelectorAll('.order-item')].map(el=>{const model=el.querySelector('.item-model').value,category=el.querySelector('.item-category').value,quantity=Math.max(1,Number(el.querySelector('.item-qty').value||1)),unitPrice=PRICES[model],unitCost=COSTS[model];return {model,category,size:el.querySelector('.item-size').value,childAge:category==='Infantil'?Number(el.querySelector('.item-age').value||0):null,quantity,unitPrice,unitCost,subtotal:unitPrice*quantity,costTotal:unitCost*quantity};});}
  function updateTotal(){const items=getItems();let t=0,q=0;[...itemsContainer.querySelectorAll('.order-item')].forEach((el,i)=>{t+=items[i].subtotal;q+=items[i].quantity;el.querySelector('.item-subtotal strong').textContent=brl(items[i].subtotal);});totalEl.textContent=brl(t);qtyEl.textContent=`${q} ${q===1?'camisa':'camisas'}`;}
  document.querySelector('#add-item').onclick=()=>addItem();
  document.querySelectorAll('.choose-model').forEach(b=>b.onclick=()=>{const first=itemsContainer.querySelector('.item-model');if(first&&itemsContainer.children.length===1)first.value=b.dataset.model;updateTotal();});
  document.querySelector('#show-address').onchange=e=>document.querySelector('#address-fields').classList.toggle('hidden',!e.target.checked);
  form.querySelector('[name="whatsapp"]').oninput=e=>{let v=e.target.value.replace(/\D/g,'').slice(0,11);if(v.length>10)v=v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');else if(v.length>6)v=v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');else if(v.length>2)v=v.replace(/(\d{2})(\d+)/,'($1) $2');e.target.value=v;};

  async function saveOrder(order){
    if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){const a=JSON.parse(localStorage.getItem('manto_orders')||'[]');a.unshift(order);localStorage.setItem('manto_orders',JSON.stringify(a));return {demo:true};}
    const row={order_id:order.orderId,created_at_display:order.createdAt,customer_name:order.name,whatsapp:order.whatsapp,city:order.city,delivery:order.delivery,payment:order.payment,neighborhood:order.neighborhood,address:order.address,address_number:order.addressNumber,complement:order.complement,notes:order.notes,items:order.items,subtotal:order.subtotal,discount:order.discount,total:order.total,total_cost:order.totalCost,profit:order.profit,status:order.status,source:'Site'};
    const r=await fetch(`${cfg.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/orders`,{method:'POST',headers:{apikey:cfg.SUPABASE_ANON_KEY,Authorization:`Bearer ${cfg.SUPABASE_ANON_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(row)});if(!r.ok)throw new Error('Não foi possível registrar o pedido. Verifique a configuração do banco de dados.');return {demo:false};
  }
  form.onsubmit=async e=>{e.preventDefault();msg.innerHTML='';const items=getItems();if(items.some(i=>i.category==='Infantil'&&(!i.childAge||i.childAge<1))){msg.innerHTML='<div class="form-message error">Informe a idade da criança em todas as camisas infantis.</div>';return;}const btn=document.querySelector('#submit-button');btn.disabled=true;btn.textContent='Registrando pedido...';const fd=new FormData(form),d=Object.fromEntries(fd.entries()),subtotal=items.reduce((s,i)=>s+i.subtotal,0),totalCost=items.reduce((s,i)=>s+i.costTotal,0),orderId=`MM-${Date.now().toString().slice(-8)}`;const order={orderId,createdAt:new Date().toLocaleString('pt-BR'),name:d.name.trim(),whatsapp:d.whatsapp.trim(),city:d.city.trim(),delivery:d.delivery,payment:'Dinheiro ou PIX',neighborhood:(d.neighborhood||'').trim(),address:(d.address||'').trim(),addressNumber:(d.addressNumber||'').trim(),complement:(d.complement||'').trim(),notes:(d.notes||'').trim(),items,subtotal,discount:0,total:subtotal,totalCost,profit:subtotal-totalCost,status:'Novo',source:'Site'};try{const result=await saveOrder(order);msg.innerHTML=`<div class="form-message success"><b>Pedido ${esc(orderId)} registrado!</b><br>${result.demo?'Este teste foi salvo neste navegador. Configure o Supabase para sincronizar entre dispositivos.':'Seu pedido foi enviado com sucesso.'}</div>`;if(cfg.WHATSAPP_SELLER){const summary=items.map(i=>`${i.quantity}x ${i.model} / ${i.category} / ${i.size}${i.childAge?` / ${i.childAge} anos`:''}`).join(' | '),text=encodeURIComponent(`Olá! Fiz o pedido ${orderId} do Manto Monumental. ${summary}. Total: ${brl(order.total)}.`);msg.innerHTML+=`<a class="btn btn-secondary" style="margin-top:10px;width:100%" target="_blank" href="https://wa.me/${String(cfg.WHATSAPP_SELLER).replace(/\D/g,'')}?text=${text}">Confirmar pelo WhatsApp</a>`;}form.reset();itemsContainer.innerHTML='';addItem();document.querySelector('#address-fields').classList.add('hidden');loadPublicCount();}catch(err){msg.innerHTML=`<div class="form-message error">${esc(err.message)}</div>`;}finally{btn.disabled=false;btn.textContent='Finalizar pedido';}};

  function setupCarousel(root,auto=false){const slides=[...root.querySelectorAll(auto?'.hero-slide':'.model-slides img')];let i=0;const dots=auto?document.querySelector('#hero-dots'):null;const show=n=>{i=(n+slides.length)%slides.length;slides.forEach((s,j)=>s.classList.toggle('active',j===i));if(dots){[...dots.children].forEach((d,j)=>d.classList.toggle('active',j===i));}const c=root.querySelector?.('.model-counter');if(c)c.textContent=`${i+1} / ${slides.length}`;};if(dots){slides.forEach((_,j)=>{const b=document.createElement('button');b.type='button';b.onclick=()=>show(j);dots.appendChild(b);});}const prev=auto?document.querySelector('.hero-prev'):root.querySelector('.model-prev'),next=auto?document.querySelector('.hero-next'):root.querySelector('.model-next');prev.onclick=()=>show(i-1);next.onclick=()=>show(i+1);show(0);if(auto)setInterval(()=>show(i+1),5500);}
  setupCarousel(document.querySelector('.hero-carousel'),true);document.querySelectorAll('[data-carousel]').forEach(c=>setupCarousel(c,false));
  function tick(){const end=new Date(cfg.ORDER_DEADLINE||'2026-08-30T23:59:59-03:00').getTime(),diff=Math.max(0,end-Date.now()),days=Math.floor(diff/86400000),hours=Math.floor(diff%86400000/3600000),mins=Math.floor(diff%3600000/60000),secs=Math.floor(diff%60000/1000);document.querySelector('#cd-days').textContent=String(days).padStart(2,'0');document.querySelector('#cd-hours').textContent=String(hours).padStart(2,'0');document.querySelector('#cd-minutes').textContent=String(mins).padStart(2,'0');document.querySelector('#cd-seconds').textContent=String(secs).padStart(2,'0');}tick();setInterval(tick,1000);
  async function loadPublicCount(){const el=document.querySelector('#public-shirt-count');try{if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){const a=JSON.parse(localStorage.getItem('manto_orders')||'[]'),q=a.filter(o=>o.status!=='Cancelado').flatMap(o=>o.items||[]).reduce((s,i)=>s+Number(i.quantity||0),0);el.textContent=q;return;}const r=await fetch(`${cfg.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/rpc/public_shirt_count`,{method:'POST',headers:{apikey:cfg.SUPABASE_ANON_KEY,Authorization:`Bearer ${cfg.SUPABASE_ANON_KEY}`,'Content-Type':'application/json'},body:'{}'});if(r.ok)el.textContent=Number(await r.json()||0);}catch{} }
  addItem();loadPublicCount();
})();
