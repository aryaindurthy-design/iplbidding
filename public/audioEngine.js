// Broadcast-Grade Audio Engine with 50+ Top Indian Mass Hero Anthems & BGMs
// Guaranteed Zero-Repeat Shuffled Auction Rotation & Strict RCB Audio Isolation
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.speechEnabled = true;
    this.currentAudioEl = null;
    this.fadeTimer = null;
    this.fadeInterval = null;

    // Track played songs so ONE SONG ONLY ONCE per auction session
    this.playedTracks = new Set();
    this.rcbBuyCount = 0;

    // Team-specific buy counters
    this.teamBuyCounts = {
      rcb: 0,
      csk: 0,
      mi: 0,
      srh: 0,
      kkr: 0,
      rr: 0,
      gt: 0,
      pbks: 0,
      dc: 0,
      lsg: 0
    };

    // DEFINITIVE 52-TRACK MASTER HERO CATALOG WITH EXACT HIGH-ENERGY DROP TIMESTAMPS
    this.catalog = {
      // ==================== STRICTLY RCB EXCLUSIVE ====================
      rcb_insta: {
        key: 'rcb_insta',
        url: '/audio/rcb.m4a',
        start: 0.0,
        title: 'RCB Instagram Viral Reel Anthem',
        artist: 'Trending Instagram Audio (RCB Reel)',
        tag: '🔥 RCB VIRAL REEL DROP',
        rcbOnly: true
      },
      rcb_mass: {
        key: 'rcb_mass',
        url: '/audio/rcb_mass.m4a',
        start: 18.0,
        title: 'Ee Sala Cup Namde - Stadium Chant',
        artist: 'RCB Play Bold Mass BGM',
        tag: '⚡ 100K STADIUM CHANT DROP',
        rcbOnly: true
      },

      // ==================== TELUGU / TOLLYWOOD HERO BLOCKBUSTERS ====================
      // 1. Pawan Kalyan - They Call Him OG
      og_geetha: {
        key: 'og_geetha',
        url: '/audio/og_geetha.m4a',
        start: 39.5, // Exact vocal blast after 38s silence breakdown!
        title: "They Call Him OG - Geetha's Rescue (Vocal Blast)",
        artist: 'Thaman S (Pawan Kalyan OG)',
        tag: '🦅 OG GEETHA RESCUE VOCAL DROP'
      },
      og_return: {
        key: 'og_return',
        url: '/audio/og_geetha.m4a',
        start: 82.0,
        title: 'They Call Him OG - Return of The OG Beast Mode',
        artist: 'Thaman S (Pawan Kalyan OG)',
        tag: '⚡ THE RETURN OF OG FIRE'
      },
      og_cheetah: {
        key: 'og_cheetah',
        url: '/audio/srh.m4a',
        start: 18.0,
        title: 'They Call Him OG - Hungry Cheetah Drop',
        artist: 'Thaman S (Pawan Kalyan OG)',
        tag: '🔥 HUNGRY CHEETAH ROAR'
      },
      og_cheetah_fire: {
        key: 'og_cheetah_fire',
        url: '/audio/srh.m4a',
        start: 56.0,
        title: 'They Call Him OG - Firestorm Trap Drop',
        artist: 'Thaman S (Pawan Kalyan OG)',
        tag: '💥 CHEETAH FIRESTORM BASS'
      },
      og_faisla: {
        key: 'og_faisla',
        url: '/audio/og_faisla.m4a',
        start: 22.0,
        title: 'They Call Him OG - OG Ka Faisla Firestorm',
        artist: 'Thaman S (Pawan Kalyan OG)',
        tag: '⚡ OG KA FAISLA PEAK DROP'
      },
      og_bloodbath: {
        key: 'og_bloodbath',
        url: '/audio/og_faisla.m4a',
        start: 64.0,
        title: 'They Call Him OG - Bloodbath Symphony',
        artist: 'Thaman S (Pawan Kalyan OG)',
        tag: '🗡️ OG BLOODBATH SYMPHONY'
      },

      // 2. Jr NTR - Devara & RRR
      devara_fear: {
        key: 'devara_fear',
        url: '/audio/devara.m4a',
        start: 35.2,
        title: 'Devara - Fear Song (All Hail The Tiger)',
        artist: 'Anirudh Ravichander (Jr NTR Devara)',
        tag: '🐅 DEVARA TIGER DROP'
      },
      devara_thunder: {
        key: 'devara_thunder',
        url: '/audio/devara.m4a',
        start: 78.0,
        title: 'Devara - Rakthame Choodu Thunder Drop',
        artist: 'Anirudh Ravichander (Jr NTR Devara)',
        tag: '🩸 RAKTHAME CHOODU BASS'
      },
      rrr_naatu: {
        key: 'rrr_naatu',
        url: '/audio/rrr.m4a',
        start: 34.0,
        title: 'RRR - Naatu Naatu Mass Hook',
        artist: 'MM Keeravaani (Ram Charan & Jr NTR)',
        tag: '🏆 NAATU NAATU OSCAR HOOK'
      },
      rrr_dosti: {
        key: 'rrr_dosti',
        url: '/audio/rrr.m4a',
        start: 72.0,
        title: 'RRR - Dosti Thunder Drums & Horns',
        artist: 'MM Keeravaani (RRR Epic)',
        tag: '🥁 RRR THUNDER DRUMS'
      },

      // 3. Mahesh Babu - Guntur Kaaram
      kurchi_madatha: {
        key: 'kurchi_madatha',
        url: '/audio/kurchi.m4a',
        start: 52.4,
        title: 'Guntur Kaaram - Kurchi Madathapetti Mass',
        artist: 'Thaman S (Mahesh Babu)',
        tag: '💥 MASS FOLK PEAK DROP'
      },
      kurchi_folk: {
        key: 'kurchi_folk',
        url: '/audio/kurchi.m4a',
        start: 94.0,
        title: 'Guntur Kaaram - Signature Folk Dappu Rhythm',
        artist: 'Thaman S (Mahesh Babu)',
        tag: '🪘 THAMAN FOLK DAPPU BEAT'
      },
      dum_masala: {
        key: 'dum_masala',
        url: '/audio/dum_masala.m4a',
        start: 43.8,
        title: 'Guntur Kaaram - Dum Masala Mass Anthem',
        artist: 'Thaman S (Mahesh Babu)',
        tag: '🌶️ DUM MASALA FIRE DROP'
      },
      dum_jaragandi: {
        key: 'dum_jaragandi',
        url: '/audio/dum_masala.m4a',
        start: 86.0,
        title: 'Guntur Kaaram - Jaragandi Jaragandi Hook',
        artist: 'Thaman S (Mahesh Babu)',
        tag: '⚡ JARAGANDI SWAG DROP'
      },

      // 4. Allu Arjun - Pushpa 2 & Ala Vaikunthapurramuloo
      pushpa_fire: {
        key: 'pushpa_fire',
        url: '/audio/pushpa.m4a',
        start: 25.0,
        title: 'Pushpa 2 The Rule - Wild Fire Drop',
        artist: 'Devi Sri Prasad (Allu Arjun Pushpa 2)',
        tag: '🔥 PUSHPA RULE FIRE DROP'
      },
      pushpa_angaaron: {
        key: 'pushpa_angaaron',
        url: '/audio/pushpa.m4a',
        start: 62.0,
        title: 'Pushpa 2 - Angaaron Dholak Mass Beat',
        artist: 'Devi Sri Prasad (Allu Arjun Pushpa 2)',
        tag: '💃 ANGAARON MASS DHOLAK'
      },
      ramuloo_hook: {
        key: 'ramuloo_hook',
        url: '/audio/ramuloo.m4a',
        start: 26.0,
        title: 'Ala Vaikunthapurramuloo - Ramuloo Ramulaa',
        artist: 'Thaman S (Allu Arjun AVPL)',
        tag: '🪩 RAMULOO RAMULAA FOLK'
      },
      ramuloo_swag: {
        key: 'ramuloo_swag',
        url: '/audio/ramuloo.m4a',
        start: 66.0,
        title: 'Ala Vaikunthapurramuloo - Allu Arjun Swag',
        artist: 'Thaman S (Allu Arjun)',
        tag: '🕺 BUNTY SWAG ANTHEM'
      },

      // 5. Prabhas - Salaar, Baahubali & Kalki
      salaar_war: {
        key: 'salaar_war',
        url: '/audio/lsg.m4a',
        start: 26.0,
        title: 'Salaar - War Horn & Battle Choir',
        artist: 'Ravi Basrur (Prabhas Salaar)',
        tag: '⚔️ SALAAR MONSTER DROP'
      },
      salaar_varadha: {
        key: 'salaar_varadha',
        url: '/audio/lsg.m4a',
        start: 76.0,
        title: 'Salaar - Prithviraj Varadha Horn Drop',
        artist: 'Ravi Basrur (Salaar Ceasefire)',
        tag: '📯 VARADHA WAR CRY'
      },
      saahore_glory: {
        key: 'saahore_glory',
        url: '/audio/saahore.m4a',
        start: 24.0,
        title: 'Baahubali 2 - Saahore Baahubali Glory Anthem',
        artist: 'MM Keeravaani (Prabhas Baahubali)',
        tag: '👑 SAAHORE BAAHUBALI'
      },
      saahore_warcry: {
        key: 'saahore_warcry',
        url: '/audio/saahore.m4a',
        start: 66.0,
        title: 'Baahubali 2 - Daler Mehndi War Cry',
        artist: 'MM Keeravaani (Prabhas)',
        tag: '⚔️ BAAHUBALI WAR HORNS'
      },
      kalki_bhairava: {
        key: 'kalki_bhairava',
        url: '/audio/kalki.m4a',
        start: 22.0,
        title: 'Kalki 2898 AD - Bhairava Cinematic Drop',
        artist: 'Santhosh Narayanan (Prabhas Kalki)',
        tag: '🌌 BHAIRAVA GLADIATOR'
      },
      kalki_gladiator: {
        key: 'kalki_gladiator',
        url: '/audio/kalki.m4a',
        start: 58.0,
        title: 'Kalki 2898 AD - Future Gladiator Choir',
        artist: 'Santhosh Narayanan (Kalki 2898 AD)',
        tag: '⚡ COMPLEX WAR ANTHEM'
      },

      // 6. Megastar Chiranjeevi & Nandamuri Balakrishna
      poonakaalu_loading: {
        key: 'poonakaalu_loading',
        url: '/audio/poonakaalu.m4a',
        start: 32.0,
        title: 'Waltair Veerayya - Poonakaalu Loading',
        artist: 'Devi Sri Prasad (Megastar Chiranjeevi)',
        tag: '🔥 POONAKAALU LOADING'
      },
      poonakaalu_party: {
        key: 'poonakaalu_party',
        url: '/audio/poonakaalu.m4a',
        start: 70.0,
        title: 'Waltair Veerayya - Boss Party Megastar Swag',
        artist: 'Devi Sri Prasad (Megastar Chiranjeevi)',
        tag: '🎉 BOSS PARTY MEGASTAR'
      },
      akhanda_roar: {
        key: 'akhanda_roar',
        url: '/audio/akhanda.m4a',
        start: 18.0,
        title: 'Akhanda - Balayya Title Roar',
        artist: 'Thaman S (Nandamuri Balakrishna)',
        tag: '🦁 JAI BALAYYA AKHANDA'
      },
      akhanda_tandavam: {
        key: 'akhanda_tandavam',
        url: '/audio/akhanda.m4a',
        start: 54.0,
        title: 'Akhanda - Shiva Tandavam Dhol Beat',
        artist: 'Thaman S (Balakrishna Akhanda)',
        tag: '🔱 SHIVA TANDAVAM DHOL'
      },

      // ==================== TAMIL / KOLLYWOOD HERO BLOCKBUSTERS ====================
      // 7. Thalapathy Vijay - Leo, Master & Beast
      leo_badass: {
        key: 'leo_badass',
        url: '/audio/csk.m4a',
        start: 28.0,
        title: 'Leo - Badass Mr. Leo Heavy Drop',
        artist: 'Anirudh Ravichander (Thalapathy Vijay)',
        tag: '🦁 BADASS ANIRUDH BASS'
      },
      leo_sweet: {
        key: 'leo_sweet',
        url: '/audio/csk.m4a',
        start: 68.0,
        title: 'Leo - Bloody Sweet Heavy Bass Drop',
        artist: 'Anirudh Ravichander (Thalapathy Vijay)',
        tag: '🍫 BLOODY SWEET BASS'
      },
      master_jd: {
        key: 'master_jd',
        url: '/audio/dc.m4a',
        start: 14.0,
        title: 'Master JD - Swagger Trumpet Drop',
        artist: 'Anirudh Ravichander (Thalapathy Vijay)',
        tag: '🎺 JD SWAGGER TRUMPET'
      },
      master_raid: {
        key: 'master_raid',
        url: '/audio/dc.m4a',
        start: 48.0,
        title: 'Master - Vaathi Raid Heavy Rap Drop',
        artist: 'Anirudh Ravichander (Thalapathy Vijay)',
        tag: '🎤 VAATHI RAID RAP'
      },
      arabic_kuthu_viral: {
        key: 'arabic_kuthu_viral',
        url: '/audio/arabic_kuthu.m4a',
        start: 30.0,
        title: 'Beast - Arabic Kuthu Viral Hook',
        artist: 'Anirudh Ravichander (Thalapathy Vijay)',
        tag: '💃 ARABIC KUTHU DROP'
      },
      arabic_halamithi: {
        key: 'arabic_halamithi',
        url: '/audio/arabic_kuthu.m4a',
        start: 72.0,
        title: 'Beast - Halamithi Habibo Beat Drop',
        artist: 'Anirudh Ravichander (Thalapathy Vijay)',
        tag: '🔥 HALAMITHI HABIBO'
      },

      // 8. Superstar Rajinikanth - Jailer & Petta
      jailer_hukum: {
        key: 'jailer_hukum',
        url: '/audio/kkr.m4a',
        start: 24.0,
        title: 'Jailer - Tiger Ka Hukum',
        artist: 'Anirudh Ravichander (Superstar Rajinikanth)',
        tag: '🐯 HUKUM TIGER DROP'
      },
      jailer_alappara: {
        key: 'jailer_alappara',
        url: '/audio/kkr.m4a',
        start: 72.0,
        title: 'Jailer - Alappara Kelapparom Whistle Beat',
        artist: 'Anirudh Ravichander (Superstar Rajinikanth)',
        tag: '👑 ALAPPARA KELAPPAROM'
      },
      marana_mass_intro: {
        key: 'marana_mass_intro',
        url: '/audio/marana_mass.m4a',
        start: 28.0,
        title: 'Petta - Marana Mass Superstar Intro',
        artist: 'Anirudh Ravichander (Superstar Rajinikanth)',
        tag: '🕶️ RAJINI MARANA MASS'
      },
      marana_thara_local: {
        key: 'marana_thara_local',
        url: '/audio/marana_mass.m4a',
        start: 75.0,
        title: 'Petta - Anirudh Thara Local Beat',
        artist: 'Anirudh Ravichander (Petta Paraak)',
        tag: '🥁 THARA LOCAL DAPPU'
      },

      // 9. Kamal Haasan & Suriya - Vikram & Kaithi
      vikram_rolex: {
        key: 'vikram_rolex',
        url: '/audio/mi.m4a',
        start: 12.0,
        title: 'Vikram - Rolex Sir Siren & Bass Drop',
        artist: 'Anirudh Ravichander (Kamal Haasan & Suriya)',
        tag: '👑 ROLEX SIR EERIE SIREN'
      },
      vikram_eagle: {
        key: 'vikram_eagle',
        url: '/audio/mi.m4a',
        start: 45.0,
        title: 'Vikram - Eagle is Coming Monster Beat',
        artist: 'Anirudh Ravichander (Kamal Haasan)',
        tag: '🦅 EAGLE IS COMING'
      },
      dilli_kabaddi_bgm: {
        key: 'dilli_kabaddi_bgm',
        url: '/audio/dilli_kabaddi.m4a',
        start: 16.0,
        title: 'Kaithi - Dilli Kabaddi Scene BGM',
        artist: 'Sam CS (Karthi Kaithi)',
        tag: '🏏 DILLI KABADDI BGM'
      },
      dilli_action_metal: {
        key: 'dilli_action_metal',
        url: '/audio/dilli_kabaddi.m4a',
        start: 50.0,
        title: 'Kaithi - Heavy Action Metal Guitar',
        artist: 'Sam CS (Lokesh Cinematic Universe)',
        tag: '🎸 LCU ACTION HEAVY METAL'
      },

      // 10. Rocking Star Yash - KGF Chapter 2
      kgf_monster: {
        key: 'kgf_monster',
        url: '/audio/kgf.m4a',
        start: 20.0,
        title: 'KGF 2 - The Monster Song Sub-Bass',
        artist: 'Ravi Basrur (Rocking Star Yash)',
        tag: '💥 KGF MONSTER SUB-BASS'
      },
      kgf_toofan: {
        key: 'kgf_toofan',
        url: '/audio/kgf.m4a',
        start: 72.0,
        title: 'KGF 2 - Toofan Stadium Heavy Drop',
        artist: 'Ravi Basrur (Rocking Star Yash)',
        tag: '🌪️ TOOFAN STADIUM DROP'
      },

      // 11. Sai Abhyankkar & Shubh Viral Hits
      katchi_sera_hook: {
        key: 'katchi_sera_hook',
        url: '/audio/rr.m4a',
        start: 28.0,
        title: 'Katchi Sera - Viral Hook Drop',
        artist: 'Sai Abhyankkar',
        tag: '✨ VIRAL REEL HOOK'
      },
      katchi_flute: {
        key: 'katchi_flute',
        url: '/audio/rr.m4a',
        start: 62.0,
        title: 'Katchi Sera - Flute & Bass Drop',
        artist: 'Sai Abhyankkar',
        tag: '🎶 VIRAL FLUTE BEAT'
      },
      aasa_kooda_chorus: {
        key: 'aasa_kooda_chorus',
        url: '/audio/gt.m4a',
        start: 32.0,
        title: 'Aasa Kooda - Main Chorus Hook',
        artist: 'Sai Abhyankkar',
        tag: '💖 INSTA TRENDING BEAT'
      },
      aasa_groovy: {
        key: 'aasa_groovy',
        url: '/audio/gt.m4a',
        start: 68.0,
        title: 'Aasa Kooda - Groovy Bassline',
        artist: 'Sai Abhyankkar',
        tag: '✨ GROOVY SYNTH BASS'
      },
      cheques_sunroof: {
        key: 'cheques_sunroof',
        url: '/audio/pbks.m4a',
        start: 22.0,
        title: 'Cheques - Sunroof Bass Drop',
        artist: 'Shubh',
        tag: '💸 SUNROOF HEAVY BASS'
      },
      cheques_dholak: {
        key: 'cheques_dholak',
        url: '/audio/pbks.m4a',
        start: 58.0,
        title: 'Cheques - Rolling Dholak Beat',
        artist: 'Shubh',
        tag: '🥁 ROLLING PUNJABI DHOLAK'
      }
    };

    // Regional franchise preferences for authentic local flavor
    this.franchisePreferences = {
      rcb: ['og_geetha', 'devara_fear', 'kurchi_madatha', 'dum_masala', 'kgf_monster', 'leo_badass', 'saahore_glory'],
      srh: ['og_geetha', 'og_cheetah', 'og_faisla', 'devara_fear', 'pushpa_fire', 'kurchi_madatha', 'dum_masala', 'saahore_glory', 'akhanda_roar', 'poonakaalu_loading', 'ramuloo_hook'],
      csk: ['leo_badass', 'jailer_hukum', 'master_jd', 'marana_mass_intro', 'arabic_kuthu_viral', 'dilli_kabaddi_bgm', 'og_geetha'],
      mi: ['vikram_rolex', 'kgf_monster', 'salaar_war', 'rrr_naatu', 'leo_badass', 'kalki_bhairava', 'dilli_kabaddi_bgm'],
      kkr: ['jailer_hukum', 'marana_mass_intro', 'vikram_rolex', 'og_faisla', 'kurchi_madatha', 'pushpa_fire', 'saahore_glory'],
      rr: ['katchi_sera_hook', 'aasa_kooda_chorus', 'og_geetha', 'rrr_naatu', 'ramuloo_hook', 'pushpa_fire'],
      gt: ['aasa_kooda_chorus', 'katchi_sera_hook', 'og_faisla', 'devara_fear', 'leo_badass', 'arabic_kuthu_viral'],
      pbks: ['cheques_sunroof', 'cheques_dholak', 'og_cheetah', 'kgf_monster', 'dum_masala', 'akhanda_roar'],
      dc: ['master_jd', 'jailer_hukum', 'rrr_naatu', 'pushpa_fire', 'og_geetha', 'arabic_kuthu_viral'],
      lsg: ['salaar_war', 'pushpa_fire', 'devara_fear', 'kgf_monster', 'kurchi_madatha', 'saahore_glory', 'kalki_bhairava']
    };
  }

  // Reset played tracks on fresh auction session
  resetSession() {
    this.playedTracks.clear();
    this.rcbBuyCount = 0;
    Object.keys(this.teamBuyCounts).forEach(k => {
      this.teamBuyCounts[k] = 0;
    });
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopCurrentAudio();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    return this.muted;
  }

  stopCurrentAudio() {
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    if (this.currentAudioEl) {
      try {
        this.currentAudioEl.pause();
        this.currentAudioEl.currentTime = 0;
      } catch (e) {}
      this.currentAudioEl = null;
    }
  }

  // Crisp Wooden Gavel Bang
  playGavel() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.012));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.14);

    oscGain.gain.setValueAtTime(1.0, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);

    noise.connect(filter);
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.2);
    noise.stop(now + 0.2);
  }

  // Silky-Smooth Acoustic Bid Click
  playBidSound() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.035);

    const bufferSize = this.ctx.sampleRate * 0.025;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.006));
    }
    const clickNoise = this.ctx.createBufferSource();
    clickNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, now);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    clickNoise.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(this.ctx.destination);

    clickNoise.start(now);
    clickNoise.stop(now + 0.025);
  }

  // Dramatic 3D Stadium Doors Opening / Arena Entrance SFX
  playDoorsOpen() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;

    // 1. Heavy Sub-Bass Impact (Doors unlocking)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // 2. Rising Mechanical Whoosh & Stadium Echo (Doors swinging open)
    const bufferSize = this.ctx.sampleRate * 0.9;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(progress * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.9);
    filter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.5, now + 0.35);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.95);

    // 3. Gavel Hit at the climax of door swing
    setTimeout(() => {
      this.playGavel();
    }, 450);
  }

  // Tension Ticking Clock
  playTick(pitch = 500) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // GET NEXT SHUFFLED TRACK FOR TEAM
  // Guaranteed:
  // - ONE SONG ONLY ONCE across the entire auction! (50+ songs ensure zero repeats)
  // - RCB songs (rcb_insta & rcb_mass) play ONLY FOR RCB, NEVER for other franchises!
  // - For RCB: 4 of 11 buys get rcb_insta, 2 get rcb_mass, other 5 get unique hero tracks!
  // - For all other franchises: select from 50 unplayed hero tracks with regional preference!
  getNextTrackForTeam(teamId) {
    const tid = (teamId || 'rcb').toLowerCase();
    this.teamBuyCounts[tid] = (this.teamBuyCounts[tid] || 0) + 1;

    // 1. STRICT RCB RULE: Only RCB gets RCB songs!
    if (tid === 'rcb') {
      const cyclePos = this.rcbBuyCount % 11;
      this.rcbBuyCount++;
      // In an 11-player squad:
      // Slots 0, 3, 6, 9 (4 buys) -> Requested Instagram Reel audio!
      if ([0, 3, 6, 9].includes(cyclePos)) {
        return this.catalog.rcb_insta;
      }
      // Slots 2, 8 (2 buys) -> Ee Sala Cup Namde Stadium Anthem!
      if ([2, 8].includes(cyclePos)) {
        return this.catalog.rcb_mass;
      }
      // The other 5 buys pick a unique mass hero track below!
    }

    // 2. All other team buys (and RCB's other 5 buys):
    // MUST NEVER INCLUDE RCB SONGS (rcb_insta or rcb_mass)!
    const generalHeroKeys = Object.keys(this.catalog).filter(k => !this.catalog[k].rcbOnly);

    // Filter to tracks that have NOT been played yet in this auction session
    let availableKeys = generalHeroKeys.filter(k => !this.playedTracks.has(k));

    // If all 50 hero songs have been played, reset rotation cycle so auction continues
    if (availableKeys.length === 0) {
      this.playedTracks.clear();
      availableKeys = generalHeroKeys.slice();
    }

    // Check if team's preferred hero songs are available in the unplayed pool
    const prefs = this.franchisePreferences[tid] || [];
    const availablePrefs = prefs.filter(k => availableKeys.includes(k));

    let chosenKey;
    if (availablePrefs.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePrefs.length);
      chosenKey = availablePrefs[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * availableKeys.length);
      chosenKey = availableKeys[randomIndex];
    }

    // Mark as played so each song plays ONLY ONCE in the auction!
    this.playedTracks.add(chosenKey);

    return this.catalog[chosenKey];
  }

  // PLAY TEAM ANTHEM AT EXACT PEAK DROP POINT (5.8s total duration with smooth 3-second fadeout)
  playTeamAnthem(teamId) {
    if (this.muted) return null;
    this.init();
    this.stopCurrentAudio();

    const track = this.getNextTrackForTeam(teamId);
    if (!track) return null;

    const audio = new Audio(track.url);
    this.currentAudioEl = audio;
    audio.volume = 1.0;

    try {
      audio.currentTime = track.start || 0.0;
    } catch (e) {
      console.warn('Seek offset notice:', e);
    }

    audio.play().then(() => {
      // Play full energy for 2.8s, then smoothly fade out over the last 3 seconds!
      this.fadeTimer = setTimeout(() => {
        let vol = 1.0;
        const fadeSteps = 30; // 30 steps * 100ms = 3.0 seconds fadeout!
        const stepVol = 1.0 / fadeSteps;
        this.fadeInterval = setInterval(() => {
          vol -= stepVol;
          if (vol <= 0.04) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            this.stopCurrentAudio();
          } else if (this.currentAudioEl) {
            this.currentAudioEl.volume = Math.max(0, vol);
          }
        }, 100);
      }, 2800);
    }).catch(err => {
      console.warn('Audio playback notice:', err);
    });

    return track;
  }

  // Voice Commentary Announcement
  announceSold(playerName, teamName, amountCrore) {
    if (this.muted || !this.speechEnabled) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const text = `SOLD! ${playerName} goes to ${teamName} for ${amountCrore} Crores!`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.15;
      utterance.pitch = 1.15;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

window.audioEngine = new AudioEngine();
