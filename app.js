(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var I=function(id){return '<svg class="ico"><use href="icons.svg#'+id+'"/></svg>'};

  /* menu telefon */
  var burger=$('.burger'), panel=$('.panel');
  if(burger&&panel){
    burger.addEventListener('click',function(){
      var o=panel.classList.toggle('open');
      burger.setAttribute('aria-expanded',o);
      burger.innerHTML=I(o?'i-close':'i-menu');
      document.body.style.overflow=o?'hidden':'';
    });
    $$('a',panel).forEach(function(a){a.addEventListener('click',function(){panel.classList.remove('open');burger.innerHTML=I('i-menu');document.body.style.overflow='';})});
  }

  /* dolny pasek po przewinieciu za hero */
  var mob=$('.mob'), hero=$('.hero,.phero');
  if(mob&&hero&&'IntersectionObserver' in window){
    new IntersectionObserver(function(e){mob.classList.toggle('widac',!e[0].isIntersecting)},{rootMargin:'-60% 0px 0px 0px'}).observe(hero);
  }

  /* lightbox */
  var lb=document.createElement('div');lb.className='lb';
  lb.innerHTML='<button class="x" aria-label="Zamknij">'+I('i-close')+'</button><button class="pv" aria-label="Poprzednie">'+I('i-chev')+'</button><img alt=""><button class="nx" aria-label="Następne">'+I('i-chev')+'</button><div class="cnt"></div>';
  document.body.appendChild(lb);
  var lbList=[],lbI=0,lbImg=$('img',lb);
  function show(){lbImg.src=lbList[lbI].dataset.full||$('img',lbList[lbI]).src;lbImg.alt=$('img',lbList[lbI]).alt;$('.cnt',lb).textContent=(lbI+1)+' / '+lbList.length}
  $$('[data-gal] button').forEach(function(b){
    b.addEventListener('click',function(){lbList=$$('button',b.closest('[data-gal]'));lbI=lbList.indexOf(b);show();lb.classList.add('open')});
  });
  $('.x',lb).onclick=function(){lb.classList.remove('open')};
  $('.pv',lb).onclick=function(e){e.stopPropagation();lbI=(lbI-1+lbList.length)%lbList.length;show()};
  $('.nx',lb).onclick=function(e){e.stopPropagation();lbI=(lbI+1)%lbList.length;show()};
  lb.addEventListener('click',function(e){if(e.target===lb)lb.classList.remove('open')});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')lb.classList.remove('open');if(e.key==='ArrowRight')$('.nx',lb).click();if(e.key==='ArrowLeft')$('.pv',lb).click()});

  /* linki "zapytaj o ten typ" ustawiaja formularz */
  $$('[data-typ]').forEach(function(a){
    a.addEventListener('click',function(){
      var r=$('input[name="typ"][value="'+a.dataset.typ+'"]');if(r)r.checked=true;
    });
  });

  /* formularze - makieta bez wysylki */
  $$('form.form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=$('.f-ok',f);
      var name=(f.elements.imie&&f.elements.imie.value.trim())||'';
      ok.textContent='Dziękujemy'+(name?', '+name:'')+'. W wersji docelowej zapytanie trafi do biura sprzedaży, a odpowiedź przyjdzie zwykle w ciągu jednego dnia roboczego. W tej wizualizacji formularz niczego nie wysyła.';
      ok.classList.add('show');
    });
  });

  /* toast */
  var toast=document.createElement('div');toast.className='toast';document.body.appendChild(toast);var tt;
  function say(t){toast.innerHTML=I('i-check')+'<span>'+t+'</span>';toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},2400)}

  /* sklep - makieta koszyka */
  var drawer=$('.drawer');
  if(drawer){
    var cart=[], shade=$('.shade');
    var zl=function(n){return n.toLocaleString('pl-PL')+' zł'};
    function render(){
      var b=$('.drawer-b'),sum=0,n=0;
      if(!cart.length){b.innerHTML='<p class="empty">Koszyk jest pusty.</p>'}
      else b.innerHTML=cart.map(function(c,i){
        n+=c.q; if(c.p)sum+=c.p*c.q;
        return '<div class="ci"><div><b>'+c.name+'</b><br><span class="muted">'+(c.p?zl(c.p)+' / szt.':'cena po zapytaniu')+'</span></div><div class="q"><button data-a="-" data-i="'+i+'" aria-label="Mniej">'+I('i-minus')+'</button><span>'+c.q+'</span><button data-a="+" data-i="'+i+'" aria-label="Więcej">'+I('i-plus')+'</button></div><button class="rm" data-a="x" data-i="'+i+'">usuń</button></div>';
      }).join('');
      $('.sum b').textContent=zl(sum);
      var hasAsk=cart.some(function(c){return !c.p});
      $('.ask-note').style.display=hasAsk?'block':'none';
      $$('.cart-btn b').forEach(function(x){x.textContent=n?n:''});
    }
    $('.drawer-b').addEventListener('click',function(e){
      var t=e.target.closest('button[data-a]');if(!t)return;var i=+t.dataset.i;
      if(t.dataset.a==='+')cart[i].q++;
      if(t.dataset.a==='-'){cart[i].q--;if(cart[i].q<1)cart.splice(i,1)}
      if(t.dataset.a==='x')cart.splice(i,1);
      render();
    });
    function open(){drawer.classList.add('open');shade.classList.add('open')}
    function close(){drawer.classList.remove('open');shade.classList.remove('open')}
    $$('.cart-btn').forEach(function(b){b.addEventListener('click',open)});
    shade.addEventListener('click',close);$('.drawer-h button').addEventListener('click',close);
    $$('.prod').forEach(function(p){
      var btn=$('.add',p),sel=$('select',p),price=$('.price',p);
      if(sel){sel.addEventListener('change',function(){var o=sel.options[sel.selectedIndex];price.innerHTML=zl(+o.dataset.p)+' <small>brutto</small>'})}
      if(btn)btn.addEventListener('click',function(){
        var name=p.dataset.name,pr=0;
        if(sel){var o=sel.options[sel.selectedIndex];name+=' '+o.value;pr=+o.dataset.p}
        var ex=cart.filter(function(c){return c.name===name})[0];
        if(ex)ex.q++;else cart.push({name:name,p:pr,q:1});
        render();say(pr?'Dodano do koszyka':'Dodano do zapytania');
      });
    });
    $('.order').addEventListener('click',function(){
      var m=$('.order-msg');m.style.display='block';
      m.textContent=cart.length?'To makieta sklepu: płatności online (np. BLIK, przelew) podłączymy po uruchomieniu strony. Pozycje bez ceny trafią do biura jako zapytanie.':'Dodaj najpierw produkt do koszyka.';
    });
    /* filtry */
    $$('.filters button').forEach(function(b){
      b.addEventListener('click',function(){
        $$('.filters button').forEach(function(x){x.classList.toggle('on',x===b)});
        var k=b.dataset.f;
        $$('.prod').forEach(function(p){p.style.display=(k==='all'||p.dataset.cat===k)?'':'none'});
      });
    });
    render();
  }
})();
