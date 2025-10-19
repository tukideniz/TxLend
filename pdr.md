

# 🧩 Ürün Tasarım Gereksinimleri (PDR) - Workshop Template

## 🎯 Temel Başlıklar

* **Proje Adı:** DeFinition
* **Tür:** Basit Blockchain Uygulaması
* **Platform:** Stellar Soroban
* **Hedef:** Basic frontend + basit contract entegrasyonu + testnet deployment


## 🎯 Proje Özeti: Projede basic ve karmaşık yapılı olmayan bir frontend yapılacak, daha sonrasında 2-3 fonksiyondan oluşan basit bir smart contract yazılacak ve bu hatasız şekilde frontende entegre edilecek. Bu sırada projenin modern bir görünüme sahip olması da önemli!

## 🚀 Kısaca Projenizi Anlatın:  DeFinition, Stellar Soroban'ın güvenli veri kaydı gücünü kullanarak, finansal işlemlerin ötesinde bir ihtiyaca odaklanan minimalist bir dApp'tir. Projenin amacı, günlük hayatta ödünç verilen küçük eşyaların (kitap, alet vb.) anlık sorumluluk tanımını inkar edilemez bir şekilde kaydetmektir. Basit bir arayüz ile kullanıcılar, bir eşyayı kime ödünç verdiklerini (o eşyanın yeni sorumlusunu) cüzdan adresiyle kaydeder ve eşya geri geldiğinde bu tanımı kaldırır. Bu minimal dApp, sadece 3 temel fonksiyon ve Freighter Wallet entegrasyonu kullanarak, 'Kimdeydi bu?' belirsizliğini ortadan kaldırır ve blockchain'in bir güven ve sorumluluk defteri olarak nasıl kullanılabileceğini sade bir şekilde kanıtlar.Ayrica ''Ben birine bir şey vermemiş olsam bile, başkası benim adıma kayıt yapabilir mi?'' riskini require auth mekanizması kullanarak cozmus oldum. define borrower fonksiyonunu sadece ödünç verenin (lender_address) kendi Freighter cüzdanı ile imzalayarak çağırabilmesini zorunlu kıldım. Bu sayede, sistem inkâr edilemez bir sorumluluk tanımı sunar: Kaydı yapan kişi, kontrat düzeyinde yetkilendirilmiştir ve bu da kimin, hangi eşya için, hangi tanımı yaptığını kesinleştirir."

## 📋 Problem Tanımı

Basic, modern görünümlü bir frontend arayüzün yapıp daha sonrasında buna uygun, çok basit bir **Soroban smart contract** yazıp entegre etmek. Karmaşık iş mantığı olmayan, temel blockchain işlemlerini destekleyen minimal bir uygulama.

---

## ✅ Yapılacaklar (Sadece Bunlar)

### Frontend Geliştirme

* Basic ve modern görünümlü bir frontend geliştireceğiz
* Karmaşık yapısı olmayacak


### Smart Contract Geliştirme

* Tek amaçlı, basit contract yazılacak
* Maksimum 3-4 fonksiyon içerecek
* Temel blockchain işlemleri (read/write)
* Minimal veri saklama
* Kolay test edilebilir fonksiyonlar

### Frontend Entegrasyonu

* Mevcut frontend'e müdahale edilmeyecek
* Sadece **JavaScript entegrasyon kodları** eklenecek
* Contract fonksiyonları frontend'e bağlanacak

### Wallet Bağlantısı

* **Freighter Wallet API** entegrasyonu
* Basit connect/disconnect işlemleri
* FreighterWalletDocs.md dosyasına bakarak bu dökümandaki bilgilerle ilerlemeni istiyorum 


---

## ❌ Yapılmayacaklar (Kesinlikle)

### Contract Tarafında

* ❌ Karmaşık iş mantığı
* ❌ Çoklu token yönetimi
* ❌ Gelişmiş access control
* ❌ Multi-signature işlemleri
* ❌ Complex state management
* ❌ Time-locked functions
* ❌ Fee calculation logic

### Frontend Tarafında

* ❌ Frontend tarafına karmaşık bir dosya yapısı yapılmayacak

---

## 🛠 Teknik Spesifikasyonlar

### Minimal Tech Stack

* **Frontend:** Next.js, Tailwind CSS, TypeScript
* **Contract:** Rust + Soroban SDK (basic)
* **Wallet:** Freighter API (sadece connect/sign)
* **Network:** Stellar Testnet

---

## 🧪 Test Senaryoları

* ✅ Contract deploy edilebiliyor mu?
* ✅ Wallet bağlantısı çalışıyor mu?
* ✅ Contract fonksiyonu çağrılabiliyor mu?
* ✅ Sonuç frontend'e dönüyor mu?
* ✅ Frontend düzgün çalışıyor mu?

---

## 📱 Copilot/Cursor'dan Vibe Coding sırasında uymasını istediğim ve check etmesi gereken adımlar

### Adım 2: Contract Yazımı 

* Basit contract template
* 3-4 fonksiyon maksimum
* Deploy et

### Adım 3: Entegrasyon

* Wallet connection
* Contract entegrasyonu
* Sonuç gösterme
---

## 🎯 Başarı Kriterleri

### Teknik Başarı

* ✅ Contract testnet'te çalışıyor
* ✅ Frontend contract entegrasyonu düzgün yapılmış
* ✅ Freighter wallet ile birlikte connect olabilme
* ✅ 3-4 fonksiyonlu basic çalışan bir contracta sahip olmak.

