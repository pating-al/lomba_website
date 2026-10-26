if (!foundCert) {
        const matchKey = Object.keys(certDatabase).find(key => certDatabase[key].name.toLowerCase() === inputVal.toLowerCase());
        if (matchKey) {
          foundCert = certDatabase[matchKey];
        } else if (!upperInput.startsWith('KM-')) {
          foundCert = {
            name: inputVal,
            skill: 'Level Terampil (Kompetensi Mandiri Produksi Lokal)',
            date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
          };
        }
      }


      if (foundCert) {
        resultBox.className = 'alert-box alert-success';
        resultBox.innerHTML = `
          <strong>✅ SERTIFIKAT RESMI & TERVERIFIKASI</strong>
          <p class="margin-top-sm">Sertifikat terdaftar secara sah dalam basis data Tawakkal Team / KaryaMandiri.</p>
          <p style="margin-top:6px; font-size:0.9rem;">
            • Nama Peserta: <strong>${foundCert.name}</strong><br>
            • Keterampilan: <strong>${foundCert.skill}</strong><br>
            • Tanggal Penerbitan: <strong>${foundCert.date}</strong>
          </p>
        `;
      } else {
        resultBox.className = 'alert-box alert-danger';
        resultBox.innerHTML = `
          <strong>❌ SERTIFIKAT TIDAK DITEMUKAN</strong>
          <p class="margin-top-sm">Kode atau nama <strong>"${inputVal}"</strong> tidak ditemukan dalam database resmi KaryaMandiri.</p>
        `;
      }
    };


    window.renderBarterListings = function() {
      const container = document.getElementById('barter-list-container');
      if (!container) return;


      container.innerHTML = window.barterListings.map(b => `
        <div class="card" style="margin-bottom:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${b.owner}</strong>
            <span class="badge-tag" style="background:#d1fae5; color:#047857;">${b.status}</span>
          </div>
          <div class="grid-2 margin-top-sm" style="gap:10px;">
            <div style="background:rgba(13,148,136,0.05); padding:10px; border-radius:10px;">
              <span class="text-muted font-sm">Menawarkan:</span>
              <p style="font-weight:600; color:var(--primary-teal);">${b.offer}</p>
            </div>
            <div style="background:rgba(5,150,105,0.05); padding:10px; border-radius:10px;">
              <span class="text-muted font-sm">Membutuhkan:</span>
              <p style="font-weight:600; color:var(--primary-emerald);">${b.want}</p>
            </div>
          </div>
          <button type="button" class="btn-primary margin-top-sm" onclick="alert('Pengajuan barter terkirim ke ${b.owner}!')"><i class="ph ph-handshake"></i> Ajukan Tukar Bahan</button>
        </div>
      `).join('');
    };


    window.addBarterListing = function() {
      const offer = document.getElementById('barter-offer-input')?.value.trim();
      const want = document.getElementById('barter-want-input')?.value.trim();


      if (!offer || !want) { alert('Isi penawaran dan bahan yang kamu butuhkan!'); return; }


      window.barterListings.unshift({ id: Date.now(), owner: 'Kelompok Tawakkal', offer, want, status: 'Tersedia' });
      document.getElementById('barter-offer-input').value = '';
      document.getElementById('barter-want-input').value = '';
      window.renderBarterListings();
    };


    window.readActiveStepVoice = function() {
      const currentText = window.productionSteps[window.currentStepIndex]?.text;
      if (!currentText) return;


      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(Langkah ${window.currentStepIndex + 1}: ${currentText});
        speech.lang = 'id-ID';
        window.speechSynthesis.speak(speech);
      } else {
        alert('Fitur suara tidak didukung oleh browser ini.');
      }
    };


    window.renderModules = function() {
      const container = document.getElementById('module-grid-list');
      const homeContainer = document.getElementById('home-course-list');
      const keyword = document.getElementById('search-module-input')?.value.toLowerCase() || '';


      let filtered = window.modules.filter(m => {
        let matchCat = (window.currentModuleFilter === 'all') || (m.category === window.currentModuleFilter);
        let matchSearch = m.title.toLowerCase().includes(keyword) || m.desc.toLowerCase().includes(keyword);
        return matchCat && matchSearch;
      });


      if (container) {
        container.innerHTML = filtered.length ? filtered.map(m => `
          <div class="card" style="margin-bottom:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="badge-tag" style="background:#ccfbf1; color:#0f766e;">${m.category}</span>
              <button type="button" class="bookmark-btn" onclick="window.toggleBookmark(${m.id})">
                <i class="${m.bookmarked ? 'ph-fill ph-bookmark-simple' : 'ph ph-bookmark-simple'}"></i>
              </button>
            </div>
            <h3 style="font-size:1.05rem; margin-bottom:6px;">${m.title}</h3>
            <p class="text-muted font-sm">${m.desc}</p>
            <button type="button" class="btn-primary margin-top-sm" onclick="window.startWorkshopModule('${m.title}')">
              <i class="ph ph-play"></i> Mulai Pelatihan
            </button>
          </div>
        ).join('') : <p class="text-muted text-center" style="grid-column: 1/-1;">Modul tidak ditemukan.</p>`;
      }


      if (homeContainer) {
        homeContainer.innerHTML = window.modules.slice(0, 4).map(m => `
          <div style="padding:10px 0; border-bottom:1px solid var(--border-color);">
            <strong style="font-size:0.9rem;">${m.title}</strong>
            <p class="text-muted font-sm">${m.category} • Waktu: ${m.time} Jam</p>
          </div>
        `).join('');
      }
    };


    window.toggleBookmark = function(id) {
      const mod = window.modules.find(m => m.id === id);
      if (mod) {
        mod.bookmarked = !mod.bookmarked;
        window.renderModules();
        window.renderFavoriteModules();
      }
    };


    window.renderFavoriteModules = function() {
      const container = document.getElementById('favorite-grid-list');
      if (!container) return;


      const favs = window.modules.filter(m => m.bookmarked);
      if (favs.length === 0) {
        container.innerHTML = <p class="text-muted text-center" style="grid-column:1/-1;">Belum ada modul yang disimpan ke favorit.</p>;
        return;
      }


      container.innerHTML = favs.map(m => `
        <div class="card" style="margin-bottom:0;">
          <span class="badge-tag" style="background:#ccfbf1; color:#0f766e;">${m.category}</span>
          <h3 style="font-size:1.05rem; margin:8px 0 6px 0;">${m.title}</h3>
          <p class="text-muted font-sm">${m.desc}</p>
          <button type="button" class="btn-primary margin-top-sm" onclick="window.startWorkshopModule('${m.title}')">
            <i class="ph ph-play"></i> Pelajari Sekarang
          </button>
        </div>
      `).join('');
    };


    window.filterModuleCategory = function(category, element) {
      window.currentModuleFilter = category;
      document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
      if (element) element.classList.add('active');
      window.renderModules();
    };


    window.openAddModuleModal = function() { document.getElementById('modal-add-module')?.classList.add('show'); };
    window.closeAddModuleModal = function() { document.getElementById('modal-add-module')?.classList.remove('show'); };


    window.addNewModule = function() {
      const title = document.getElementById('new-mod-title')?.value.trim();
      const category = document.getElementById('new-mod-category')?.value || 'Daur Ulang';
      const time = parseInt(document.getElementById('new-mod-time')?.value) || 2;


      if (!title) { alert('Tuliskan judul modul terlebih dahulu!'); return; }


      window.modules.push({ id: Date.now(), title, category, time, level: 'Pemula', req: [], bookmarked: false, desc: 'Modul usulan baru dari komunitas KaryaMandiri.' });
      document.getElementById('new-mod-title').value = '';
      window.closeAddModuleModal();
      window.renderModules();
    };


    window.renderPasarProducts = function() {
      const container = document.getElementById('pasar-grid-list');
      const keyword = document.getElementById('search-pasar-input')?.value.toLowerCase() || '';


      if (!container) return;


      let filtered = window.pasarProducts.filter(p => p.title.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword));


      container.innerHTML = filtered.map(p => `
        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <span class="badge-tag" style="background:#d1fae5; color:#047857;">${p.category}</span>
            <h3 style="font-size:1.1rem; margin:8px 0 4px 0;">${p.title}</h3>
            <p class="font-sm text-muted">Penjual: <strong>${p.seller}</strong></p>
            <p class="margin-top-sm font-sm">${p.desc}</p>
            <div style="margin:10px 0; font-size:0.8rem; color:#059669;">
              ⭐ ${p.rating} | Terjual ${p.sold} unit
            </div>
          </div>
          <div>
            <h2 style="color:var(--primary-teal); font-size:1.3rem; margin-bottom:10px;">Rp ${p.price.toLocaleString('id-ID')}</h2>
            <button type="button" class="btn-primary" style="width:100%; justify-content:center; background:#059669;" onclick="window.buyViaWhatsApp('${p.title}', ${p.price})">
              <i class="ph-bold ph-whatsapp-logo"></i> Pesan via WhatsApp
            </button>
          </div>
        </div>
      `).join('');
    };


    window.buyViaWhatsApp = function(productName, price) {
      const message = Halo Penjual Pasar KaryaMandiri! Saya berminat membeli produk [${productName}] seharga Rp ${price.toLocaleString('id-ID')}. Mohon info cara pembayarannya.;
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/6281234567890?text=${encodedMsg}`, '_blank');
    };


    window.renderForumFeed = function() {
      const container = document.getElementById('forum-feed-list');
      if (!container) return;


      let filtered = window.forumPosts.filter(p => (window.currentForumFilter === 'all') || (p.category === window.currentForumFilter));


      container.innerHTML = filtered.map(p => `
        <div class="card" style="margin-bottom:12px; padding:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="avatar" style="width:32px; height:32px; font-size:0.75rem;">${p.author.slice(0,2).toUpperCase()}</div>
              <div>
                <strong>${p.author}</strong>
                <p class="font-sm text-muted">${p.category}</p>
              </div>
            </div>
            <span class="badge-tag">${p.category}</span>
          </div>
          <p style="font-size:0.92rem; line-height:1.5;">${p.text}</p>
          
          <div style="margin-top:12px; display:flex; gap:18px; font-size:0.85rem; color:var(--text-muted);">
            <span style="cursor:pointer;" onclick="window.likeForumPost(${p.id})">❤️ <strong>${p.likes}</strong> Apresiasi</span>
            <span>💬 <strong>${p.comments.length}</strong> Komentar</span>
          </div>


          ${p.comments.length ? `
            <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border-color); font-size:0.82rem;">
              ${p.comments.map(c => <p class="text-muted" style="margin-bottom:4px;">💬 ${c}</p>).join('')}
            </div>
          ` : ''}


          <div style="margin-top:10px; display:flex; gap:8px;">
            <input type="text" id="comment-input-${p.id}" placeholder="Tulis komentar..." style="width:100%; padding:6px 10px; border-radius:8px; border:1px solid var(--border-color); font-size:0.8rem; outline:none;">
            <button type="button" class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="window.addCommentToPost(${p.id})">Kirim</button>
          </div>
        </div>
      `).join('');
    };


    window.addForumPost = function() {
      const category = document.getElementById('forum-post-category')?.value || 'Hasil Karya';
      const text = document.getElementById('forum-input-text')?.value.trim();


      if (!text) { alert('Tuliskan isi postinganmu terlebih dahulu!'); return; }


      window.forumPosts.unshift({ id: Date.now(), author: 'Kelompok Tawakkal', category, text, likes: 1, comments: [] });
      document.getElementById('forum-input-text').value = '';
      window.renderForumFeed();
    };


    window.likeForumPost = function(id) {
      const post = window.forumPosts.find(p => p.id === id);
      if (post) { post.likes++; window.renderForumFeed(); }
    };


    window.addCommentToPost = function(id) {
      const input = document.getElementById(comment-input-${id});
      const text = input ? input.value.trim() : '';
      if (!text) return;


      const post = window.forumPosts.find(p => p.id === id);
      if (post) {
        post.comments.push(Kelompok Tawakkal: ${text});
        window.renderForumFeed();
      }
    };


    window.filterForumFeed = function(category, element) {
      window.currentForumFilter = category;
      document.querySelectorAll('#tab-forum .filter-pills .pill').forEach(p => p.classList.remove('active'));
      if (element) element.classList.add('active');
      window.renderForumFeed();
    };


    window.checkRecommendedProducts = function() {
      const jelantah = document.getElementById('chk-jelantah')?.checked;
      const plastik = document.getElementById('chk-plastik')?.checked;
      const pipa = document.getElementById('chk-pipa')?.checked;
      const kayu = document.getElementById('chk-kayu')?.checked;
      const organik = document.getElementById('chk-organik')?.checked;


      let reqs = [];
      if (jelantah) reqs.push('jelantah');
      if (plastik) reqs.push('plastik');
      if (pipa) reqs.push('pipa');
      if (kayu) reqs.push('kayu');
      if (organik) reqs.push('organik');


      const container = document.getElementById('recommended-products-list');
      if (!container) return;


      let matched = window.modules.filter(m => m.req.some(r => reqs.includes(r)));


      if (matched.length === 0) {
        container.innerHTML = <p class="text-muted">Centang bahan baku yang kamu miliki di samping untuk melihat rekomendasi modul produk!</p>;
        return;
      }


      container.innerHTML = matched.map(m => `
        <div style="padding:12px; border:1px solid var(--border-color); border-radius:12px; margin-bottom:8px; background:var(--card-bg);">
          <strong style="color:var(--primary-teal);">${m.title}</strong>
          <p class="text-muted font-sm">${m.desc}</p>
          <button type="button" class="btn-primary margin-top-sm" onclick="window.startWorkshopModule('${m.title}')">
            <i class="ph ph-play"></i> Mulai Buat Produk Ini
          </button>
        </div>
      `).join('');
    };


    window.calculateHPPAndBEP = function() {
      const material = parseFloat(document.getElementById('calc-material')?.value) || 0;
      const labor = parseFloat(document.getElementById('calc-labor')?.value) || 0;
      const overhead = parseFloat(document.getElementById('calc-overhead')?.value) || 0;
      const qty = parseInt(document.getElementById('calc-qty')?.value) || 1;
      const fixedCost = parseFloat(document.getElementById('calc-fixed-cost')?.value) || 0;
      const margin = parseFloat(document.getElementById('calc-margin')?.value) || 40;


      const totalVar = material + labor + overhead;
      const hppUnit = totalVar / qty;
      const profitUnit = hppUnit * (margin / 100);
      const priceSuggest = hppUnit + profitUnit;


      const marginPerUnit = priceSuggest - hppUnit;
      const bepUnit = marginPerUnit > 0 ? Math.ceil(fixedCost / marginPerUnit) : 0;
      const bepRupiah = bepUnit * priceSuggest;


      const formatIDR = (val) => 'Rp ' + Math.round(val).toLocaleString('id-ID');


      if (document.getElementById('hpp-unit-result')) document.getElementById('hpp-unit-result').textContent = formatIDR(hppUnit);
      if (document.getElementById('price-suggest')) document.getElementById('price-suggest').textContent = formatIDR(priceSuggest);
      if (document.getElementById('profit-per-unit')) document.getElementById('profit-per-unit').textContent = formatIDR(profitUnit);
      if (document.getElementById('bep-unit-result')) document.getElementById('bep-unit-result').textContent = ${bepUnit} Unit;
      if (document.getElementById('bep-rupiah-result')) document.getElementById('bep-rupiah-result').textContent = formatIDR(bepRupiah);
    };


    window.calculateCashflow = function() {
      const salesTarget = parseInt(document.getElementById('project-sales-target')?.value) || 25;
      const marketingCost = parseFloat(document.getElementById('project-marketing-cost')?.value) || 50000;
      const tableBody = document.getElementById('cashflow-table-body');


      if (!tableBody) return;


      const hppStr = document.getElementById('hpp-unit-result')?.textContent.replace(/[^0-9]/g, '') || '22000';
      const priceStr = document.getElementById('price-suggest')?.textContent.replace(/[^0-9]/g, '') || '30800';


      const hppPerUnit = parseFloat(hppStr) || 22000;
      const pricePerUnit = parseFloat(priceStr) || 30800;


      const formatIDR = (val) => 'Rp ' + Math.round(val).toLocaleString('id-ID');


      let rows = '';
      for (let m = 1; m <= 3; m++) {
        const target = salesTarget * m;
        const omzet = target * pricePerUnit;
        const totalCost = (target * hppPerUnit) + marketingCost;
        const netProfit = omzet - totalCost;


        rows += `
          <tr>
            <td>Bulan ke-${m}</td>
            <td>${formatIDR(omzet)}</td>
            <td style="color:var(--primary-teal); font-weight:bold;">${formatIDR(netProfit)}</td>
          </tr>
        `;
      }


      tableBody.innerHTML = rows;
    };


    window.loadQuiz = function() {
      const box = document.getElementById('quiz-box');
      if (!box) return;


      window.selectedOptionIndex = null;


      if (window.currentQuizIndex >= window.quizData.length) {
        if (window.quizScore >= 50) {
          box.innerHTML = `
            <div class="text-center">
              <i class="ph-bold ph-check-circle" style="font-size: 3.5rem; color: #059669;"></i>
              <h3 style="margin-top: 10px;">Selamat! Uji Keterampilan Selesai 🎉</h3>
              <h1 style="color: var(--primary-teal); font-size: 2.8rem; margin: 15px 0;">Skor: ${window.quizScore} / 100</h1>
              <p class="text-muted">Selamat! Nilai kamu memenuhi syarat kelulusan. Masukkan nama lengkap kamu untuk penerbitan sertifikat:</p>
              
              <div style="background: rgba(13, 148, 136, 0.05); padding: 16px; border-radius: 12px; margin-top: 15px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label>Nama Lengkap Peserta:</label>
                  <input type="text" id="user-cert-name" placeholder="Contoh: Budi Santoso" value="Haikal Syuhada Al Fatih" style="width:100%; padding:10px; border-radius:10px; border:1px solid var(--border-color); margin-top:6px;">
                </div>
              </div>


              <button type="button" class="btn-primary margin-top" onclick="window.generateCertificate()"><i class="ph ph-certificate"></i> Terbitkan Sertifikat Saya 📜</button>
            </div>
          `;
        } else {
          box.innerHTML = `
            <div class="text-center">
              <i class="ph-bold ph-x-circle" style="font-size: 3.5rem; color: #dc2626;"></i>
              <h3 style="margin-top: 10px;">Uji Keterampilan Belum Lulus ❌</h3>
              <h1 style="color: #dc2626; font-size: 2.8rem; margin: 15px 0;">Skor: ${window.quizScore} / 100</h1>
              <p class="text-muted">Nilai kamu belum mencukupi batas minimal (50 Poin). Kamu bisa coba lagi setelah 3 menit.</p>
              
              <div style="background: rgba(220, 38, 38, 0.08); padding: 16px; border-radius: 12px; margin: 20px 0;">
                <p style="font-size: 0.85rem; color: #991b1b; font-weight: 600;">WAKTU TUNGGU ULANG KUIS:</p>
                <h2 id="cooldown-timer-display" style="color:#dc2626; font-size:2.2rem; margin-top:6px;">03:00</h2>
              </div>


              <button type="button" class="btn-secondary" id="btn-retry-quiz" disabled onclick="window.resetQuiz()">
                <i class="ph ph-arrow-counter-clockwise"></i> Coba Lagi (Terkunci)
              </button>
            </div>
          `;
          window.startQuizCooldown(180);
        }
        return;
      }


      const q = window.quizData[window.currentQuizIndex];
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
          <span class="badge-tag">Soal ${window.currentQuizIndex + 1} dari ${window.quizData.length}</span>
          <span class="text-muted font-sm">Bobot: 10 Poin / Soal</span>
        </div>
        <h4 style="font-size: 1.05rem; line-height: 1.5;">${q.question}</h4>
        
        <div class="margin-top-sm">
          ${q.options.map((opt, idx) => `
            <label class="quiz-option-radio" id="quiz-opt-label-${idx}" onclick="window.selectMultipleChoiceOption(${idx})">
              <input type="radio" name="quiz_choice" value="${idx}">
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>


        <div class="margin-top" style="text-align: right;">
          <button type="button" class="btn-primary" onclick="window.submitMultipleChoiceAnswer()"><i class="ph ph-arrow-right"></i> Jawab & Lanjut</button>
        </div>
      `;
    };


    window.selectMultipleChoiceOption = function(idx) {
      window.selectedOptionIndex = idx;
      document.querySelectorAll('.quiz-option-radio').forEach((el, i) => {
        if (i === idx) {
          el.classList.add('selected');
          const radioInput = el.querySelector('input[type="radio"]');
          if (radioInput) radioInput.checked = true;
        } else {
          el.classList.remove('selected');
        }
      });
    };


    window.submitMultipleChoiceAnswer = function() {
      if (window.selectedOptionIndex === null) {
        alert('Pilih salah satu jawaban terlebih dahulu!');
        return;
      }


      if (window.selectedOptionIndex === window.quizData[window.currentQuizIndex].answer) {
        window.quizScore += 10;
        alert('Jawaban Tepat! +10 Poin 🎉');
      } else {
        alert('Jawaban belum tepat.');
      }


      window.currentQuizIndex++;
      window.loadQuiz();
    };


    window.startQuizCooldown = function(seconds) {
      let timeLeft = seconds;
      if (window.quizTimerInterval) clearInterval(window.quizTimerInterval);


      window.quizTimerInterval = setInterval(() => {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        
        const display = document.getElementById('cooldown-timer-display');
        if (display) display.textContent = ${mins}:${secs};


        if (timeLeft <= 0) {
          clearInterval(window.quizTimerInterval);
          const retryBtn = document.getElementById('btn-retry-quiz');
          if (retryBtn) {
            retryBtn.disabled = false;
            retryBtn.className = "btn-primary";
            retryBtn.innerHTML = <i class="ph ph-arrow-counter-clockwise"></i> Coba Lagi Sekarang 🔄;
          }
        }
      }, 1000);
    };


    window.resetQuiz = function() {
      window.currentQuizIndex = 0;
      window.quizScore = 0;
      if (window.quizTimerInterval) clearInterval(window.quizTimerInterval);
      window.loadQuiz();
    };


    window.generateCertificate = function() {
      const inputName = document.getElementById('user-cert-name')?.value.trim();
      if (!inputName) { alert('Isi nama kamu dulu!'); return; }


      document.getElementById('cert-display-name').textContent = inputName;
      const today = new Date();
      document.getElementById('cert-display-date').textContent = today.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });


      window.openCertModal();
    };


    window.downloadCertificatePDF = function() {
      const element = document.getElementById('cert-to-print');
      const name = document.getElementById('cert-display-name')?.textContent || 'Peserta';
      
      const opt = {
        margin: 5,
        filename: Sertifikat_${name.replace(/\s+/g, '_')}.pdf,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };


      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(element).save();
      } else {
        window.print();
      }
    };


    window.openCertModal = function() { document.getElementById('modal-cert')?.classList.add('show'); };
    window.closeCertModal = function() { document.getElementById('modal-cert')?.classList.remove('show'); };
    window.printCertificate = function() { window.print(); };


    window.toggleDarkMode = function() {
      document.body.classList.toggle('dark-mode');
      const icon = document.getElementById('theme-icon');
      if (icon) icon.className = document.body.classList.contains('dark-mode') ? 'ph ph-sun' : 'ph ph-moon';
    };


    window.sendDevMessage = function() {
      const name = document.getElementById('dev-msg-name')?.value.trim();
      const text = document.getElementById('dev-msg-text')?.value.trim();
      if (!name || !text) { alert('Harap isi nama dan pesan kamu terlebih dahulu!'); return; }
      alert(Terima kasih ${name}! Pesan kamu telah berhasil dikirimkan kepada Tawakkal Team (Faathin & Haikal). 🎉);
      document.getElementById('dev-msg-name').value = '';
      document.getElementById('dev-msg-text').value = '';
    };


    window.exportHPPToCSV = function() {
      const hpp = document.getElementById('hpp-unit-result')?.textContent || '0';
      const price = document.getElementById('price-suggest')?.textContent || '0';
      const bepUnit = document.getElementById('bep-unit-result')?.textContent || '0';


      let csvContent = "data:text/csv;charset=utf-8,Metrik,Nilai\n";
      csvContent += "HPP per Unit","${hpp}"\n;
      csvContent += "Rekomendasi Harga Jual","${price}"\n;
      csvContent += "Titik Impas (BEP)","${bepUnit}"\n;


      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Laporan_Kalkulasi_HPP_BEP.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };


    window.renderWorkshopSteps = function() {
      const container = document.getElementById('step-list');
      if (!container) return;
      container.innerHTML = window.productionSteps.map((s, idx) => `
        <div style="padding:10px 14px; border-radius:10px; margin-bottom:8px; border:1px solid var(--border-color); background:${idx === window.currentStepIndex ? '#ccfbf1' : 'var(--card-bg)'}; color:${idx === window.currentStepIndex ? '#0f766e' : 'var(--text-dark)'}; font-weight:${idx === window.currentStepIndex ? 'bold' : 'normal'};">
          Langkah ${s.step}: ${s.text}
        </div>
      `).join('');
    };


    window.nextProductionStep = function() {
      if (window.currentStepIndex < window.productionSteps.length - 1) { window.currentStepIndex++; window.renderWorkshopSteps(); }
      else { alert('Selamat! Seluruh tahapan produksi telah selesai dilaksanakan dengan baik 🎉'); }
    };


    window.resetProductionStep = function() { window.currentStepIndex = 0; window.renderWorkshopSteps(); };


    window.startWorkshopModule = function(title) {
      const el = document.getElementById('ws-product-title');
      if (el) el.textContent = title;
      window.currentStepIndex = 0;
      window.renderWorkshopSteps();
      window.switchTab('workshop');
    };


    window.renderTools = function() {
      const container = document.getElementById('tool-borrow-list');
      if (!container) return;
      container.innerHTML = window.borrowTools.map(t => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--border-color); border-radius:12px; margin-bottom:8px;">
          <div>
            <strong>${t.name}</strong>
            <p class="text-muted font-sm">${t.hub}</p>
          </div>
          <button type="button" class="btn-secondary" onclick="alert('Pengajuan pinjam untuk alat [${t.name}] telah dikirim!')">${t.status === 'Tersedia' ? 'Pinjam Alat' : 'Sedang Dipakai'}</button>
        </div>
      `).join('');
    };


    window.toggleNotifModal = function() { document.getElementById('notif-dropdown')?.classList.toggle('show'); };


    // INISIALISASI EVENT LISTENERS
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM siap! Menginisialisasi komponen web KaryaMandiri...');
      
      // Pastikan semua nav-link bisa diklik
      document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const tab = btn.getAttribute('data-tab');
          if (tab) window.switchTab(tab);
        });
      });


      // Tutup notif jika klik di luar
      document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('notif-dropdown');
        const notifBtn = e.target.closest('.icon-btn');
        if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(e.target) && !notifBtn) {
          dropdown.classList.remove('show');
        }
      });


      window.renderModules();
      window.renderFavoriteModules();
      window.renderPasarProducts();
      window.renderBarterListings();
      window.renderForumFeed();
      window.renderWorkshopSteps();
      window.renderTools();
      window.calculateHPPAndBEP();
      window.calculateCashflow();
      window.checkRecommendedProducts();
      window.loadQuiz();
      
      // Pastikan tab beranda aktif di awal
      window.switchTab('beranda');
    });
  </script>
</body>
</html>