import { useState, useRef, useEffect } from "react";
import { db, auth } from "./firebase.js";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";

const CONFIG = {
  ADMIN_PASSWORD: "chichiracha101228@",
  OWNER_EMAIL: "luxwear.dz@gmail.com",
  INSTAGRAM: "https://www.instagram.com/luxwear_dz?igsh=M2w1bHhnNG8xMXBu&utm_source=qr",
  TIKTOK: "https://www.tiktok.com/@luxwear.dz?_r=1&_t=ZS-95emqC486Z0",
  FACEBOOK: "https://www.facebook.com/share/17eCcySwHc/?mibextid=wwXIfr",
  EMAILJS_SERVICE_ID: "service_7e05or8",
  EMAILJS_TEMPLATE_ID: "template_f7j4m2x",
  EMAILJS_PUBLIC_KEY: "wsqQ8-_I-48ENr5m2",
};

const CATEGORIES = [
  { id: "all", label: "Tous", icon: "✦" },
  { id: "vetements", label: "Vêtements", icon: "🧥" },
  { id: "chaussures", label: "Chaussures", icon: "👟" },
  { id: "parfums", label: "Parfums", icon: "🌸" },
  { id: "casquettes", label: "Casquettes", icon: "🧢" },
  { id: "sacoches", label: "Sacoches", icon: "👜" },
  { id: "montres", label: "Montres", icon: "⌚" },
  { id: "robes", label: "Robes & Caftan", icon: "👗" },
  { id: "bijoux", label: "Bijoux", icon: "💍" },
  { id: "lunettes", label: "Lunettes", icon: "🕶️" },
];

const WILAYAS_TARIFS = {
  "Adrar": { stopdesk: 650, domicile: 1100, delai: "48-96H" },
  "Chlef": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Laghouat": { stopdesk: 550, domicile: 850, delai: "24-48H" },
  "Oum El Bouaghi": { stopdesk: 450, domicile: 750, delai: "24-48H" },
  "Batna": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Béjaïa": { stopdesk: 200, domicile: 400, delai: "24-48H" },
  "Biskra": { stopdesk: 550, domicile: 850, delai: "24-48H" },
  "Béchar": { stopdesk: 800, domicile: 1150, delai: "24-48H" },
  "Blida": { stopdesk: 400, domicile: 600, delai: "24-48H" },
  "Bouira": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Tamanrasset": { stopdesk: 800, domicile: 1300, delai: "48-96H" },
  "Tébessa": { stopdesk: 450, domicile: 800, delai: "24-48H" },
  "Tlemcen": { stopdesk: 450, domicile: 800, delai: "24-48H" },
  "Tiaret": { stopdesk: 450, domicile: 750, delai: "24-48H" },
  "Tizi Ouzou": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Alger": { stopdesk: 400, domicile: 550, delai: "24-48H" },
  "Djelfa": { stopdesk: 550, domicile: 850, delai: "24-48H" },
  "Jijel": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Sétif": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Saïda": { stopdesk: 450, domicile: 800, delai: "24-48H" },
  "Skikda": { stopdesk: 450, domicile: 800, delai: "24-48H" },
  "Sidi Bel Abbès": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Annaba": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Guelma": { stopdesk: 450, domicile: 750, delai: "24-48H" },
  "Constantine": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Médéa": { stopdesk: 450, domicile: 650, delai: "24-48H" },
  "Mostaganem": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "M'Sila": { stopdesk: 450, domicile: 750, delai: "24-48H" },
  "Mascara": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Ouargla": { stopdesk: 450, domicile: 850, delai: "24-72H" },
  "Oran": { stopdesk: 600, domicile: 700, delai: "24-48H" },
  "El Bayadh": { stopdesk: 550, domicile: 900, delai: "24-72H" },
  "Illizi": { stopdesk: 800, domicile: 1400, delai: "48-96H" },
  "Bordj Bou Arréridj": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "Boumerdès": { stopdesk: 450, domicile: 700, delai: "24-48H" },
  "El Tarf": { stopdesk: 450, domicile: 750, delai: "24-48H" },
  "Tindouf": { stopdesk: 800, domicile: 1300, delai: "48-96H" },
  "Tissemsilt": { stopdesk: 450, domicile: 750, delai: "24-48H" },
  "El Oued": { stopdesk: 550, domicile: 850, delai: "24-72H" },
  "Khenchela": { stopdesk: 500, domicile: 800, delai: "24-72H" },
  "Souk Ahras": { stopdesk: 500, domicile: 800, delai: "24-72H" },
  "Tipaza": { stopdesk: 450, domicile: 650, delai: "24-72H" },
  "Mila": { stopdesk: 450, domicile: 650, delai: "24-72H" },
  "Aïn Defla": { stopdesk: 450, domicile: 650, delai: "24-72H" },
  "Naâma": { stopdesk: 550, domicile: 900, delai: "24-72H" },
  "Aïn Témouchent": { stopdesk: 450, domicile: 700, delai: "24-72H" },
  "Ghardaïa": { stopdesk: 550, domicile: 950, delai: "24-72H" },
  "Relizane": { stopdesk: 450, domicile: 700, delai: "24-72H" },
  "Timimoun": { stopdesk: 800, domicile: 1400, delai: "48-96H" },
  "Ouled Djellal": { stopdesk: 600, domicile: 900, delai: "24-72H" },
  "Beni Abbes": { stopdesk: 0, domicile: 1300, delai: "48-96H" },
  "In Salah": { stopdesk: 800, domicile: 1400, delai: "48-96H" },
  "Touggourt": { stopdesk: 600, domicile: 900, delai: "24-72H" },
  "El M'Ghair": { stopdesk: 550, domicile: 850, delai: "24-72H" },
  "El Meniaa": { stopdesk: 550, domicile: 950, delai: "24-72H" },
};
const WILAYAS = Object.keys(WILAYAS_TARIFS);
const AVATARS = ["👩","👨","👩🏽","👨🏽","👩🏿","👨🏿","🧑","👱‍♀️","👱"];
const TAILLES_VETEMENTS = ["XS","S","M","L","XL","XXL","XXXL"];
const TAILLES_ROBES = ["36","38","40","42","44","46","48","50"];
const POINTURES = ["36","37","38","39","40","41","42","43","44","45","46"];
const TAILLES_CASQUETTES = ["S/M","L/XL","Unique"];
const CAT_TAILLES = ["vetements","robes"];
const CAT_POINTURES = ["chaussures"];
const CAT_GENDER = ["vetements","chaussures","sacoches","casquettes","montres","bijoux","lunettes"];
const COULEURS = [
  { label: "Noir", hex: "#1a1a1a" }, { label: "Blanc", hex: "#f5f5f5" },
  { label: "Beige", hex: "#d4b896" }, { label: "Marron", hex: "#7b4f2e" },
  { label: "Gris", hex: "#888888" }, { label: "Bleu marine", hex: "#1b2a4a" },
  { label: "Bleu ciel", hex: "#5aafd4" }, { label: "Rouge", hex: "#cc2222" },
  { label: "Rose", hex: "#e87a9a" }, { label: "Vert", hex: "#2e7d52" },
  { label: "Kaki", hex: "#7a7a3a" }, { label: "Jaune", hex: "#e8c840" },
  { label: "Orange", hex: "#e07830" }, { label: "Bordeaux", hex: "#6e1a2a" },
  { label: "Doré", hex: "#d4af37" }, { label: "Argenté", hex: "#b0b0b0" },
  { label: "Violet", hex: "#6a3a8a" }, { label: "Camel", hex: "#c19a6b" },
];
const EMPTY_PRODUCT = { name: "", category: "vetements", gender: null, price: "", oldPrice: "", image: "", images: [], badge: "", brand: "", sizes: [], pointures: [], colors: [], inStock: true };
const G = "linear-gradient(135deg,#b8960c,#d4af37)";
const MF = { fontFamily: "'Montserrat',sans-serif" };

export default function LuxWear() {
  const [page, setPage] = useState("home");
  const [darkMode, setDarkMode] = useState(true);
  const [products, setProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGender, setSelectedGender] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", wilaya: "", address: "", delivery: "domicile" });
  const [formError, setFormError] = useState("");
  const [sendingOrder, setSendingOrder] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState("produits");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [profileTab, setProfileTab] = useState("commandes");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", phone: "", password: "", avatar: "👩" });
  const [authError, setAuthError] = useState("");
  const catRef = useRef(null);
  const adminTapTimer = useRef(null);

  const T = {
    bg: darkMode ? "#0a0a0f" : "#f5f0e8",
    surface: darkMode ? "#111118" : "#ffffff",
    surface2: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    text: darkMode ? "#f0ece4" : "#1a1a2e",
    textMuted: darkMode ? "rgba(240,236,228,0.45)" : "rgba(30,30,60,0.45)",
    textFaint: darkMode ? "rgba(240,236,228,0.3)" : "rgba(30,30,60,0.3)",
    border: darkMode ? "rgba(212,175,55,0.15)" : "rgba(180,140,10,0.2)",
    borderCard: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    navBg: darkMode ? "rgba(10,10,15,0.96)" : "rgba(245,240,232,0.96)",
    headerBg: darkMode ? "#0a0a0f" : "#f5f0e8",
    inputBg: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
  };

  // ── FIREBASE: Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fu) => {
      if (fu) {
        setUser({ id: fu.uid, name: fu.displayName || "Client", email: fu.email, avatar: fu.photoURL || "👤" });
      } else { setUser(null); }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── FIREBASE: Products listener ──
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // ── FIREBASE: Orders listener ──
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
      setAllOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const myOrders = allOrders.filter(o => o.userId === user?.id);
  const cancelledCount = allOrders.filter(o => o.status === "Annulé").length;

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchGender = !selectedGender || !p.gender || p.gender === selectedGender;
    const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchGender && matchSearch;
  });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = myOrders.reduce((s, o) => s + (o.items?.reduce((a, i) => a + i.qty, 0) || 0), 0);

  const statusStyle = s => {
    if (s === "Expédié") return { bg: "rgba(100,200,100,0.15)", color: "#6dcc6d", border: "rgba(100,200,100,0.3)" };
    if (s === "Livré") return { bg: "rgba(80,160,255,0.15)", color: "#50a0ff", border: "rgba(80,160,255,0.3)" };
    if (s === "Annulé") return { bg: "rgba(255,80,80,0.15)", color: "#ff6060", border: "rgba(255,80,80,0.3)" };
    return { bg: "rgba(212,175,55,0.15)", color: "#d4af37", border: "rgba(212,175,55,0.3)" };
  };

  const toggleFav = (p, e) => { e.stopPropagation(); setFavorites(f => f.find(x => x.id === p.id) ? f.filter(x => x.id !== p.id) : [...f, p]); };
  const isFav = id => favorites.some(x => x.id === id);
  const addToCart = (p, e, size, color) => {
    if (e) e.stopPropagation();
    setCart(c => { const key = `${p.id}-${size||""}-${color||""}`; const ex = c.find(x => x.cartKey === key); return ex ? c.map(x => x.cartKey === key ? { ...x, qty: x.qty+1 } : x) : [...c, { ...p, qty: 1, cartKey: key, selectedSize: size||null, selectedColor: color||null }]; });
  };
  const removeFromCart = key => setCart(c => c.filter(x => x.cartKey !== key));
  const updateQty = (key, d) => setCart(c => c.map(x => x.cartKey === key ? { ...x, qty: Math.max(1, x.qty+d) } : x));

  const buildOrderText = o => {
    const items = o.items.map(i => `• ${i.name}${i.selectedSize ? ` (${i.selectedSize})` : ""}${i.selectedColor ? ` [${i.selectedColor}]` : ""} x${i.qty} — ${(i.price*i.qty).toLocaleString()} DA`).join("\n");
    return `🛍️ NOUVELLE COMMANDE LUXWEAR\n\n👤 ${o.form.name}\n📞 ${o.form.phone}\n📍 ${o.form.wilaya}\n🏠 ${o.form.address}\n🚚 ${o.form.delivery==="domicile"?"Domicile":"Stop Desk"}\n⏱️ ${o.livraisonDelai||""}\n\n${items}\n\n🛍️ Articles: ${o.totalArticles?.toLocaleString()} DA\n🚚 Livraison: ${o.livraisonPrix?.toLocaleString()} DA\n💰 TOTAL: ${o.total?.toLocaleString()} DA`;
  };

  const sendEmail = async o => {
    try { await fetch("https://api.emailjs.com/api/v1.0/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ service_id: CONFIG.EMAILJS_SERVICE_ID, template_id: CONFIG.EMAILJS_TEMPLATE_ID, user_id: CONFIG.EMAILJS_PUBLIC_KEY, template_params: { to_email: CONFIG.OWNER_EMAIL, subject: `🛍️ Nouvelle commande — ${o.form.name}`, message: buildOrderText(o) } }) }); } catch(e) {}
  };

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.wilaya || !form.address) { setFormError("Veuillez remplir tous les champs."); return; }
    setSendingOrder(true);
    const livraisonPrix = WILAYAS_TARIFS[form.wilaya] ? (form.delivery==="domicile" ? WILAYAS_TARIFS[form.wilaya].domicile : WILAYAS_TARIFS[form.wilaya].stopdesk) : 0;
    const newOrder = { items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, image: i.image, selectedSize: i.selectedSize||null, selectedColor: i.selectedColor||null, cartKey: i.cartKey })), total: cartTotal+livraisonPrix, totalArticles: cartTotal, livraisonPrix, livraisonDelai: WILAYAS_TARIFS[form.wilaya]?.delai||"", form: {...form}, date: new Date().toLocaleDateString("fr-FR"), status: "En attente", userId: user?.id||"guest", createdAt: new Date() };
    try { await addDoc(collection(db, "orders"), newOrder); await sendEmail(newOrder); setCart([]); setCheckoutOpen(false); setOrderSuccess(true); setForm({ name:"", phone:"", wilaya:"", address:"", delivery:"domicile" }); setFormError(""); setTimeout(()=>setOrderSuccess(false), 4000); } catch(e) { setFormError("Erreur, réessayez."); }
    setSendingOrder(false);
  };

  const handleRegister = async () => {
    if (!authForm.name || !authForm.email || !authForm.password) { setAuthError("Remplissez tous les champs."); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      await updateProfile(cred.user, { displayName: authForm.name, photoURL: authForm.avatar });
      await addDoc(collection(db, "users"), { uid: cred.user.uid, name: authForm.name, email: authForm.email, phone: authForm.phone, avatar: authForm.avatar, createdAt: new Date() });
      setAuthError("");
    } catch(e) { setAuthError(e.message.includes("email-already") ? "Email déjà utilisé." : "Erreur, réessayez."); }
  };

  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) { setAuthError("Email et mot de passe requis."); return; }
    try { await signInWithEmailAndPassword(auth, authForm.email, authForm.password); setAuthError(""); } catch(e) { setAuthError("Email ou mot de passe incorrect."); }
  };

  const handleLogout = async () => { await signOut(auth); setPage("home"); };

  const handleAdminLogin = () => { if (adminPassword === CONFIG.ADMIN_PASSWORD) { setAdminAuth(true); setAdminError(""); } else { setAdminError("Mot de passe incorrect."); } };

  const handleLogoTap = () => {
    setAdminTapCount(c => {
      const next = c+1;
      if (adminTapTimer.current) clearTimeout(adminTapTimer.current);
      if (next >= 5) { setAdminOpen(true); return 0; }
      adminTapTimer.current = setTimeout(() => setAdminTapCount(0), 2000);
      return next;
    });
  };

  // ── FIREBASE: Admin product CRUD ──
  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) return;
    const prod = { ...newProduct, price: Number(newProduct.price), oldPrice: newProduct.oldPrice ? Number(newProduct.oldPrice) : null, updatedAt: new Date() };
    try {
      if (editingProduct?.id) { await updateDoc(doc(db, "products", editingProduct.id), prod); }
      else { await addDoc(collection(db, "products"), { ...prod, createdAt: new Date() }); }
      setEditingProduct(null); setNewProduct(EMPTY_PRODUCT);
    } catch(e) { console.error(e); }
  };

  const deleteProduct = async id => { try { await deleteDoc(doc(db, "products", id)); } catch(e) {} };
  const startEdit = p => { setEditingProduct(p); setNewProduct({ ...p, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "" }); };
  const toggleStock = async (id, current) => { try { await updateDoc(doc(db, "products", id), { inStock: !current }); } catch(e) {} };
  const updateOrderStatus = async (orderId, status) => { try { await updateDoc(doc(db, "orders", orderId), { status }); } catch(e) {} };
  const cancelOrder = async (orderId) => { try { await updateDoc(doc(db, "orders", orderId), { status: "Annulé" }); setConfirmCancelId(null); } catch(e) {} };
  const deleteOrder = async (orderId) => { try { await deleteDoc(doc(db, "orders", orderId)); } catch(e) {} };

  const scrollCat = dir => { if (catRef.current) catRef.current.scrollBy({ left: dir*120, behavior: "smooth" }); };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-thumb{background:#b8960c;border-radius:2px;}
    .cs{display:flex;gap:10px;overflow-x:auto;padding:6px 2px;}
    .cs::-webkit-scrollbar{display:none;}
    .cb{flex-shrink:0;padding:8px 16px;border-radius:30px;border:1.5px solid rgba(184,150,12,0.35);background:transparent;color:#d4af37;font-size:12.5px;cursor:pointer;transition:all .25s;white-space:nowrap;font-family:'Montserrat',sans-serif;font-weight:500;}
    .cb.ac,.cb:hover{background:${G};color:#0a0a0f;border-color:transparent;}
    .pc{background:${T.surface};border-radius:16px;overflow:hidden;position:relative;cursor:pointer;transition:transform .2s;border:1px solid ${T.borderCard};}
    .pc:hover{transform:translateY(-3px);}
    .pi{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;}
    .hb{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:${darkMode?"rgba(10,10,15,0.75)":"rgba(255,255,255,0.85)"};backdrop-filter:blur(6px);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;}
    .bdg{position:absolute;top:10px;left:10px;background:${G};color:#0a0a0f;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;font-family:'Montserrat',sans-serif;}
    .bg-gold{background:${G};color:#0a0a0f;border:none;padding:12px 28px;border-radius:30px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif;font-size:13px;transition:all .2s;box-shadow:0 4px 20px rgba(212,175,55,0.35);}
    .bg-gold:hover{box-shadow:0 6px 28px rgba(212,175,55,0.55);transform:translateY(-1px);}
    .bg-gold:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
    .dr{background:${T.surface};border-radius:24px 24px 0 0;width:100%;max-width:430px;max-height:92vh;overflow-y:auto;padding:24px;color:${T.text};}
    .mo{background:${T.surface};border-radius:24px;width:92%;max-width:410px;max-height:88vh;overflow-y:auto;padding:24px;margin:auto;color:${T.text};}
    .if{background:${T.inputBg};border:1px solid rgba(212,175,55,0.25);border-radius:12px;padding:12px 16px;color:${T.text};font-size:14px;width:100%;font-family:'Montserrat',sans-serif;outline:none;transition:border-color .2s;}
    .if:focus{border-color:#d4af37;}
    .if option{background:${T.surface};}
    select.if{appearance:none;}
    .ai{background:${T.inputBg};border:1px solid rgba(212,175,55,0.2);border-radius:14px;padding:14px 16px;color:${T.text};font-size:14px;width:100%;font-family:'Montserrat',sans-serif;outline:none;transition:all .2s;}
    .ai:focus{border-color:#d4af37;}
    .ni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:8px 0;font-size:10px;font-family:'Montserrat',sans-serif;transition:color .2s;color:${T.textMuted};}
    .ni.ac,.ni:hover{color:#d4af37;}
    .gl{height:1px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:16px 0;}
    .oc{background:${T.surface2};border:1px solid rgba(212,175,55,0.18);border-radius:14px;padding:16px;margin-bottom:12px;}
    .tb{flex:1;padding:10px 0;border:none;background:transparent;color:${T.textMuted};font-family:'Montserrat',sans-serif;font-size:11px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;flex-shrink:0;}
    .tb.ac{color:#d4af37;border-bottom-color:#d4af37;}
    .cc{position:absolute;top:-5px;right:-5px;background:#d4af37;color:#0a0a0f;width:18px;height:18px;border-radius:50%;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;}
    .ps{background:rgba(212,175,55,0.07);border:1px solid rgba(212,175,55,0.15);border-radius:16px;padding:16px;text-align:center;flex:1;}
    .fm{background:${T.surface};border-radius:12px;overflow:hidden;cursor:pointer;border:1px solid ${T.borderCard};transition:transform .15s;}
    .fm:hover{transform:translateY(-2px);}
    .ac2{background:${T.surface2};border:1px solid rgba(212,175,55,0.15);border-radius:14px;padding:14px;margin-bottom:10px;}
    .cc2{background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.18);border-radius:16px;padding:18px 20px;margin-bottom:14px;cursor:pointer;transition:background .2s;}
    .cc2:hover{background:rgba(212,175,55,0.1);}
    @keyframes su{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes pi2{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}
    @keyframes fi{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .dr{animation:su .3s;}
    .mo{animation:pi2 .25s;}
    .ov{animation:fi .2s;}
  `;

  if (authLoading) return <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#d4af37", fontSize: 30 }}>✦</div></div>;

  return (
    <div style={{ fontFamily: "'Playfair Display',Georgia,serif", background: T.bg, minHeight: "100vh", color: T.text, maxWidth: 430, margin: "0 auto", position: "relative", overflowX: "hidden", transition: "background .3s,color .3s" }}>
      <style>{css}</style>

      {orderSuccess && <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: G, color: "#0a0a0f", padding: "12px 24px", borderRadius: 30, fontWeight: 700, ...MF, zIndex: 999, boxShadow: "0 8px 32px rgba(212,175,55,0.5)", whiteSpace: "nowrap", textAlign: "center" }}>✓ Commande envoyée !<br /><span style={{ fontSize: 11, fontWeight: 400 }}>Confirmation par email</span></div>}

      {/* HEADER */}
      <div style={{ padding: "20px 20px 12px", position: "sticky", top: 0, background: T.headerBg, zIndex: 50, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 2 }}>{user ? `BONJOUR, ${user.name.split(" ")[0].toUpperCase()} ${user.avatar}` : "BIENVENUE 🌟"}</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1, background: "linear-gradient(135deg,#d4af37,#f5e07d,#b8960c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer", userSelect: "none" }} onClick={handleLogoTap}>LuxWear</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSearchOpen(s => !s)} style={{ background: searchOpen ? G : "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: searchOpen ? "#0a0a0f" : "#d4af37", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>🔍</button>
            <button onClick={() => { setPage("profile"); setProfileTab("favoris"); }} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>🤍</button>
            <button onClick={() => setDarkMode(d => !d)} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>{darkMode ? "🌙" : "☀️"}</button>
          </div>
        </div>
        {searchOpen && (
          <div style={{ marginTop: 12 }}>
            <input autoFocus className="if" placeholder="Rechercher un produit..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage("home"); }} style={{ borderRadius: 30, padding: "10px 18px", fontSize: 13 }} />
            {searchQuery && <div style={{ marginTop: 6, ...MF, fontSize: 11, color: "rgba(212,175,55,0.7)" }}>{filtered.length} résultat{filtered.length !== 1 ? "s" : ""} pour "<span style={{ color: "#d4af37" }}>{searchQuery}</span>"</div>}
          </div>
        )}
      </div>

      {/* HOME */}
      {page === "home" && (
        <div style={{ padding: "0 16px 100px" }}>
          <div style={{ margin: "16px 0", borderRadius: 20, background: "linear-gradient(135deg,#1a0a00 0%,#2d1810 30%,#0d1a3d 70%,#0a0a1f 100%)", padding: "22px", position: "relative", overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)" }}>
            <div style={{ fontSize: 11, color: "rgba(212,175,55,0.8)", ...MF, letterSpacing: 3, marginBottom: 6 }}>NOUVELLE COLLECTION</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>Nouveautés<br /><span style={{ color: "#d4af37" }}>Collection 2026</span></div>
            <div style={{ fontSize: 12, color: "rgba(240,236,228,0.6)", ...MF, marginBottom: 16 }}>Découvrez les dernières tendances mode luxe</div>
            <button className="bg-gold" style={{ fontSize: 12, padding: "10px 22px" }} onClick={() => setSelectedCategory("all")}>Explorer →</button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Catégories</div>
              <div style={{ display: "flex", gap: 6 }}>{["‹","›"].map((a,i) => <button key={i} onClick={() => scrollCat(i===0?-1:1)} style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 12 }}>{a}</button>)}</div>
            </div>
            <div ref={catRef} className="cs">
              {CATEGORIES.map(c => <button key={c.id} className={`cb ${selectedCategory===c.id?"ac":""}`} onClick={() => { setSelectedCategory(c.id); setSelectedGender(null); }}>{c.icon} {c.label}</button>)}
            </div>
            {selectedCategory !== "all" && CAT_GENDER.includes(selectedCategory) && (
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {[["homme","👨 Homme"],["femme","👩 Femme"]].map(([g, label]) => (
                  <button key={g} onClick={() => setSelectedGender(selectedGender===g?null:g)} style={{ flex: 1, padding: "9px 0", borderRadius: 30, border: `1.5px solid ${selectedGender===g?"#d4af37":"rgba(212,175,55,0.2)"}`, background: selectedGender===g?"rgba(212,175,55,0.12)":"transparent", color: selectedGender===g?"#d4af37":T.textMuted, cursor: "pointer", ...MF, fontSize: 13, fontWeight: selectedGender===g?700:500 }}>{label}</button>
                ))}
              </div>
            )}
          </div>

          {products.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: T.textFaint, ...MF }}><div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div><div>Chargement des produits...</div></div>}

          <div style={{ ...MF, fontSize: 11, color: T.textFaint, marginBottom: 14 }}>{filtered.length} article{filtered.length!==1?"s":""}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className="pc" onClick={() => { setSelectedProduct(p); setPhotoIndex(0); }}>
                {p.badge && p.inStock!==false && <div className="bdg">{p.badge}</div>}
                {p.inStock===false && <div className="bdg" style={{ background: "rgba(80,80,80,0.9)", color: "#fff" }}>Rupture</div>}
                <button className="hb" onClick={e => toggleFav(p,e)}>{isFav(p.id)?"❤️":"🤍"}</button>
                <img src={p.image} alt={p.name} className="pi" loading="lazy" style={{ opacity: p.inStock===false?0.5:1 }} />
                <div style={{ padding: "12px 10px" }}>
                  <div style={{ fontSize: 10, color: "rgba(212,175,55,0.65)", ...MF, letterSpacing: 1, marginBottom: 3 }}>{p.brand}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.35 }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: p.inStock===false?T.textFaint:"#d4af37" }}>{Number(p.price).toLocaleString()} DA</span>
                    {p.oldPrice && <span style={{ fontSize: 11, color: T.textFaint, textDecoration: "line-through" }}>{Number(p.oldPrice).toLocaleString()}</span>}
                  </div>
                  {p.inStock===false ? <div style={{ width: "100%", padding: "8px 0", borderRadius: 30, background: T.surface2, color: T.textMuted, ...MF, fontSize: 11, fontWeight: 600, textAlign: "center" }}>🚫 Rupture</div>
                  : <button className="bg-gold" style={{ width: "100%", padding: "8px 0", fontSize: 11 }} onClick={e => { e.stopPropagation(); setSelectedProduct(p); setPhotoIndex(0); }}>Voir le produit</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {page === "profile" && (
        <div style={{ paddingBottom: 100 }}>
          {!user ? (
            <div style={{ padding: "30px 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>👤</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{authMode==="login"?"Connexion":"Créer un compte"}</div>
                <div style={{ fontSize: 13, color: T.textMuted, ...MF }}>{authMode==="login"?"Accédez à votre espace personnel":"Rejoignez la famille LuxWear ✨"}</div>
              </div>
              {authMode==="register" && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 10 }}>CHOISIR UN AVATAR</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{AVATARS.map(av => <button key={av} onClick={() => setAuthForm(f => ({...f, avatar: av}))} style={{ width: 46, height: 46, borderRadius: "50%", border: `2px solid ${authForm.avatar===av?"#d4af37":"rgba(212,175,55,0.2)"}`, background: authForm.avatar===av?"rgba(212,175,55,0.15)":"transparent", fontSize: 24, cursor: "pointer" }}>{av}</button>)}</div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {authMode==="register" && <div><div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>NOM COMPLET *</div><input className="ai" placeholder="Ex: Amina Benali" value={authForm.name} onChange={e => setAuthForm(f=>({...f,name:e.target.value}))} /></div>}
                <div><div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>EMAIL *</div><input className="ai" type="email" placeholder="exemple@email.com" value={authForm.email} onChange={e => setAuthForm(f=>({...f,email:e.target.value}))} /></div>
                {authMode==="register" && <div><div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>TÉLÉPHONE</div><input className="ai" placeholder="0555 000 000" value={authForm.phone} onChange={e => setAuthForm(f=>({...f,phone:e.target.value}))} /></div>}
                <div><div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>MOT DE PASSE *</div><input className="ai" type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm(f=>({...f,password:e.target.value}))} /></div>
              </div>
              {authError && <div style={{ color: "#ff6b6b", ...MF, fontSize: 12, marginTop: 12, textAlign: "center", background: "rgba(255,107,107,0.08)", padding: 10, borderRadius: 10 }}>{authError}</div>}
              <button className="bg-gold" style={{ width: "100%", marginTop: 22, fontSize: 14 }} onClick={authMode==="login"?handleLogin:handleRegister}>{authMode==="login"?"Se connecter →":"Créer mon compte →"}</button>
              <div style={{ textAlign: "center", marginTop: 18, ...MF, fontSize: 13, color: T.textMuted }}>
                {authMode==="login"?"Pas encore de compte ?":"Déjà un compte ?"}{" "}
                <span style={{ color: "#d4af37", cursor: "pointer", fontWeight: 600 }} onClick={() => { setAuthMode(authMode==="login"?"register":"login"); setAuthError(""); }}>{authMode==="login"?"S'inscrire":"Se connecter"}</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: "linear-gradient(135deg,#1a0a00 0%,#2d1810 40%,#0d1a3d 100%)", padding: "28px 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(212,175,55,0.15)", border: "2.5px solid #d4af37", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{user.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,236,228,0.5)", ...MF }}>{user.email}</div>
                  </div>
                  <button onClick={handleLogout} style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)", color: "rgba(255,150,150,0.9)", padding: "6px 12px", borderRadius: 20, cursor: "pointer", ...MF, fontSize: 11, fontWeight: 600 }}>Déco.</button>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[[myOrders.length,"Commandes"],[favorites.length,"Favoris"],[totalItems,"Articles"]].map(([v,l]) => (
                    <div key={l} className="ps"><div style={{ fontSize: 20, fontWeight: 700, color: "#d4af37" }}>{v}</div><div style={{ fontSize: 10, color: "rgba(240,236,228,0.5)", ...MF, marginTop: 2 }}>{l}</div></div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${T.border}`, background: T.headerBg, position: "sticky", top: 73, zIndex: 40 }}>
                {[["commandes","📦 Commandes"],["favoris","❤️ Favoris"],["historique","🕒 Historique"],["expedie","🚚 Expédié"],["support","💬 Support"]].map(([id,label]) => (
                  <button key={id} className={`tb ${profileTab===id?"ac":""}`} onClick={() => setProfileTab(id)}>{label}</button>
                ))}
              </div>

              <div style={{ padding: "20px 16px" }}>
                {profileTab==="commandes" && (myOrders.length===0 ? (
                  <div style={{ textAlign: "center", padding: "50px 20px", color: T.textFaint, ...MF }}><div style={{ fontSize: 44, marginBottom: 12 }}>📦</div><div>Aucune commande</div><button className="bg-gold" style={{ marginTop: 16, fontSize: 12, padding: "10px 24px" }} onClick={() => setPage("home")}>Commencer mes achats</button></div>
                ) : myOrders.map(o => {
                  const ss = statusStyle(o.status);
                  return (
                    <div key={o.id} className="oc">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ ...MF }}><div style={{ fontSize: 12, fontWeight: 700, color: "#d4af37" }}>#{o.id.slice(-6)}</div><div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{o.date}</div></div>
                        <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: "3px 10px", borderRadius: 20, fontSize: 10, ...MF, fontWeight: 700 }}>{o.status}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                        {o.items?.map((i,idx) => <div key={idx} style={{ position: "relative" }}><img src={i.image} style={{ width: 50, height: 56, borderRadius: 10, objectFit: "cover" }} /><div style={{ position: "absolute", bottom: 2, right: 2, background: "#d4af37", color: "#0a0a0f", width: 16, height: 16, borderRadius: "50%", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i.qty}</div></div>)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", ...MF, fontSize: 12 }}>
                        <span style={{ color: T.textMuted }}>{o.form?.wilaya} · {o.form?.delivery==="domicile"?"🏠":"🏪"}</span>
                        <span style={{ fontWeight: 700, color: "#d4af37", fontSize: 15 }}>{o.total?.toLocaleString()} DA</span>
                      </div>
                      {o.status==="En attente" && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ height: 1, background: "rgba(255,80,80,0.15)", marginBottom: 12 }} />
                          {confirmCancelId===o.id ? (
                            <div style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: 14, padding: 14, textAlign: "center" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Confirmer l'annulation ?</div>
                              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                                <button onClick={() => cancelOrder(o.id)} style={{ flex: 1, padding: "10px 0", borderRadius: 20, border: "none", background: "rgba(255,80,80,0.85)", color: "#fff", cursor: "pointer", ...MF, fontSize: 12, fontWeight: 700 }}>✕ Oui, annuler</button>
                                <button onClick={() => setConfirmCancelId(null)} style={{ flex: 1, padding: "10px 0", borderRadius: 20, border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#d4af37", cursor: "pointer", ...MF, fontSize: 12 }}>← Garder</button>
                              </div>
                            </div>
                          ) : <button onClick={() => setConfirmCancelId(o.id)} style={{ width: "100%", padding: "10px 0", borderRadius: 20, border: "1.5px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.07)", color: "#ff7070", cursor: "pointer", ...MF, fontSize: 12, fontWeight: 700 }}>✕ Annuler la commande</button>}
                        </div>
                      )}
                    </div>
                  );
                }))}

                {profileTab==="favoris" && (favorites.length===0 ? (
                  <div style={{ textAlign: "center", padding: "50px 20px", color: T.textFaint, ...MF }}><div style={{ fontSize: 44, marginBottom: 12 }}>🤍</div><div>Aucun favori</div><button className="bg-gold" style={{ marginTop: 16, fontSize: 12, padding: "10px 24px" }} onClick={() => setPage("home")}>Découvrir les produits</button></div>
                ) : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{favorites.map(p => <div key={p.id} className="fm" onClick={() => { setPage("home"); setTimeout(() => { setSelectedProduct(p); setPhotoIndex(0); }, 100); }}><div style={{ position: "relative" }}><img src={p.image} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} /><button className="hb" onClick={e => toggleFav(p,e)}>❤️</button></div><div style={{ padding: "10px 8px" }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 14, fontWeight: 700, color: "#d4af37", marginBottom: 8 }}>{Number(p.price).toLocaleString()} DA</div><button className="bg-gold" style={{ width: "100%", padding: "7px 0", fontSize: 11 }} onClick={e => { e.stopPropagation(); addToCart(p,e,null,null); }}>+ Panier</button></div></div>)}</div>)}

                {profileTab==="historique" && (myOrders.length===0 ? (
                  <div style={{ textAlign: "center", padding: "50px 20px", color: T.textFaint, ...MF }}><div style={{ fontSize: 44, marginBottom: 12 }}>🕒</div><div>Aucun historique</div></div>
                ) : <div>{myOrders.map(o => <div key={o.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: `1px solid ${T.surface2}`, alignItems: "center" }}><div style={{ display: "flex" }}>{o.items?.slice(0,2).map((i,idx) => <img key={idx} src={i.image} style={{ width: 46, height: 52, borderRadius: 10, objectFit: "cover", marginRight: 4 }} />)}</div><div style={{ flex: 1, ...MF }}><div style={{ fontSize: 12, fontWeight: 600 }}>{o.items?.length} article{o.items?.length>1?"s":""}</div><div style={{ fontSize: 11, color: T.textMuted }}>{o.date} · {o.form?.wilaya}</div></div><div style={{ fontWeight: 700, color: "#d4af37" }}>{o.total?.toLocaleString()} DA</div></div>)}</div>)}

                {profileTab==="expedie" && (() => { const shipped = myOrders.filter(o => o.status==="Expédié"); return shipped.length===0 ? <div style={{ textAlign: "center", padding: "50px 20px", color: T.textFaint, ...MF }}><div style={{ fontSize: 44, marginBottom: 12 }}>🚚</div><div>Aucune expédition</div></div> : shipped.map(o => <div key={o.id} className="oc" style={{ borderColor: "rgba(100,200,100,0.25)" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div style={{ ...MF }}><div style={{ fontSize: 12, fontWeight: 700, color: "#d4af37" }}>#{o.id.slice(-6)}</div><div style={{ fontSize: 11, color: T.textMuted }}>{o.date}</div></div><span style={{ background: "rgba(100,200,100,0.15)", color: "#6dcc6d", border: "1px solid rgba(100,200,100,0.3)", padding: "3px 10px", borderRadius: 20, fontSize: 10, ...MF, fontWeight: 700 }}>🚚 Expédié</span></div><div style={{ display: "flex", gap: 6 }}>{o.items?.map((i,idx) => <img key={idx} src={i.image} style={{ width: 50, height: 56, borderRadius: 10, objectFit: "cover" }} />)}</div></div>); })()}

                {profileTab==="support" && (
                  <div>
                    <div style={{ textAlign: "center", marginBottom: 24 }}><div style={{ fontSize: 50, marginBottom: 10 }}>💬</div><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Service Client LuxWear</div><div style={{ fontSize: 12, color: T.textMuted, ...MF }}>Disponible 7j/7</div></div>
                    <div className="gl" />
                    {[
                      { icon: "✉️", label: "EMAIL", value: CONFIG.OWNER_EMAIL, sub: "Réponse sous 24h", action: () => window.open(`mailto:${CONFIG.OWNER_EMAIL}`), bc: "rgba(212,175,55,0.18)", bg: "rgba(212,175,55,0.06)", color: "#d4af37" },
                      { icon: "📸", label: "INSTAGRAM", value: "@luxwear_dz", sub: "Suivez nos nouveautés", action: () => window.open(CONFIG.INSTAGRAM,"_blank"), bc: "rgba(225,48,108,0.25)", bg: "rgba(225,48,108,0.06)", color: "#e1306c" },
                      { icon: "🎵", label: "TIKTOK", value: "@luxwear.dz", sub: "Nos vidéos", action: () => window.open(CONFIG.TIKTOK,"_blank"), bc: "rgba(255,255,255,0.15)", bg: "rgba(255,255,255,0.04)", color: "#fff" },
                      { icon: "👥", label: "FACEBOOK", value: "LuxWear DZ", sub: "Page officielle", action: () => window.open(CONFIG.FACEBOOK,"_blank"), bc: "rgba(24,119,242,0.25)", bg: "rgba(24,119,242,0.06)", color: "#1877f2" },
                    ].map(c => <div key={c.label} className="cc2" style={{ borderColor: c.bc, background: c.bg }} onClick={c.action}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 46, height: 46, borderRadius: "50%", background: c.bg, border: `1px solid ${c.bc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{c.icon}</div><div style={{ flex: 1 }}><div style={{ fontSize: 10, color: c.color+"bb", ...MF, letterSpacing: 1, marginBottom: 4 }}>{c.label}</div><div style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.value}</div><div style={{ fontSize: 11, color: T.textMuted, ...MF, marginTop: 2 }}>{c.sub}</div></div><div style={{ fontSize: 18, color: c.color+"66" }}>›</div></div></div>)}
                    <div style={{ textAlign: "center", ...MF, fontSize: 11, color: T.textFaint, marginTop: 8 }}>LuxWear · Algérie 🇩🇿</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.navBg, backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 50 }}>
        <div className={`ni ${page==="home"?"ac":""}`} onClick={() => setPage("home")}><span style={{ fontSize: 20 }}>🏠</span>Accueil</div>
        <div className="ni" onClick={() => setCartOpen(true)} style={{ position: "relative" }}><span style={{ fontSize: 20 }}>🛒</span>Panier{cartCount>0&&<span className="cc">{cartCount}</span>}</div>
        <div className={`ni ${page==="profile"?"ac":""}`} onClick={() => setPage("profile")}><span style={{ fontSize: 20 }}>{user?user.avatar:"👤"}</span>Profil{user&&<span style={{ color:"#d4af37" }}> ✓</span>}</div>
      </div>

      {/* PRODUCT PAGE */}
      {selectedProduct && (() => {
        const allPhotos = [selectedProduct.image, ...(selectedProduct.images||[])].filter(Boolean);
        return (
          <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 200, overflowY: "auto", animation: "slideUp .3s" }}>
            <div style={{ position: "sticky", top: 0, background: T.bg, zIndex: 10, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
              <button onClick={() => { setSelectedProduct(null); setPhotoIndex(0); setSelectedSize(null); setSelectedColor(null); }} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
              <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", ...MF, letterSpacing: 2 }}>{selectedProduct.brand}</div><div style={{ fontSize: 14, fontWeight: 700 }}>{selectedProduct.name}</div></div>
              <button onClick={e => toggleFav(selectedProduct,e)} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{isFav(selectedProduct.id)?"❤️":"🤍"}</button>
            </div>
            <div style={{ position: "relative", background: "#000" }}
              onTouchStart={e => { e.currentTarget._sx = e.touches[0].clientX; }}
              onTouchEnd={e => { const dx = e.changedTouches[0].clientX - e.currentTarget._sx; if (Math.abs(dx)>50) setPhotoIndex(i => dx<0?(i+1)%allPhotos.length:(i-1+allPhotos.length)%allPhotos.length); }}>
              <img src={allPhotos[photoIndex]} alt={selectedProduct.name} style={{ width: "100%", height: 420, objectFit: "cover", display: "block", userSelect: "none" }} />
              {allPhotos.length>1 && <>
                <button onClick={() => setPhotoIndex(i=>(i-1+allPhotos.length)%allPhotos.length)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>‹</button>
                <button onClick={() => setPhotoIndex(i=>(i+1)%allPhotos.length)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", width: 38, height: 38, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>›</button>
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>{allPhotos.map((_,i) => <div key={i} onClick={() => setPhotoIndex(i)} style={{ width: i===photoIndex?22:7, height: 7, borderRadius: 10, background: i===photoIndex?"#d4af37":"rgba(255,255,255,0.5)", cursor: "pointer", transition: "all .3s" }} />)}</div>
                <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, ...MF }}>{photoIndex+1}/{allPhotos.length}</div>
              </>}
              {selectedProduct.badge&&selectedProduct.inStock!==false&&<div style={{ position: "absolute", top: 14, left: 14, background: G, color: "#0a0a0f", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, ...MF }}>{selectedProduct.badge}</div>}
            </div>
            {allPhotos.length>1 && <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", background: T.surface, borderBottom: `1px solid ${T.border}` }}>{allPhotos.map((img,i) => <img key={i} src={img} onClick={() => setPhotoIndex(i)} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, flexShrink: 0, cursor: "pointer", border: `2.5px solid ${i===photoIndex?"#d4af37":"transparent"}`, opacity: i===photoIndex?1:0.5, transition: "all .2s" }} />)}</div>}
            <div style={{ padding: "20px 16px 120px" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", ...MF, letterSpacing: 2, marginBottom: 4 }}>{selectedProduct.brand?.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{selectedProduct.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: "#d4af37" }}>{Number(selectedProduct.price).toLocaleString()} DA</span>
                  {selectedProduct.oldPrice && <div><span style={{ fontSize: 16, color: T.textFaint, textDecoration: "line-through", ...MF }}>{Number(selectedProduct.oldPrice).toLocaleString()} DA</span><div style={{ fontSize: 11, color: "#6dcc6d", ...MF, fontWeight: 600 }}>-{Math.round((1-selectedProduct.price/selectedProduct.oldPrice)*100)}% de réduction</div></div>}
                </div>
              </div>
              <div className="gl" />
              {selectedProduct.colors?.length>0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 12, display: "flex", justifyContent: "space-between" }}><span>COULEUR</span>{selectedColor&&<span style={{ color: "#d4af37", fontWeight: 700 }}>✓ {selectedColor}</span>}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{selectedProduct.colors.map(cl => { const cd = COULEURS.find(c=>c.label===cl); const active = selectedColor===cl; return <button key={cl} onClick={() => setSelectedColor(active?null:cl)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 20, border: `2px solid ${active?"#d4af37":"rgba(212,175,55,0.2)"}`, background: active?"rgba(212,175,55,0.12)":T.surface2, cursor: "pointer" }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: cd?.hex||"#888", border: "2px solid rgba(255,255,255,0.2)" }} /><span style={{ ...MF, fontSize: 13, color: active?"#d4af37":T.textMuted, fontWeight: active?700:400 }}>{cl}</span></button>; })}</div>
                </div>
              )}
              {(() => { const hasTailles=selectedProduct.sizes?.length>0; const hasPointures=selectedProduct.pointures?.length>0; const options=hasPointures?selectedProduct.pointures:hasTailles?selectedProduct.sizes:[]; const label=hasPointures?"POINTURE":hasTailles?"TAILLE":null; if (!label) return null; return <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 12, display: "flex", justifyContent: "space-between" }}><span>{label}</span>{selectedSize&&<span style={{ color: "#d4af37", fontWeight: 700 }}>✓ {selectedSize}</span>}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{options.map(s => <button key={s} onClick={() => setSelectedSize(s===selectedSize?null:s)} style={{ minWidth: 52, padding: "10px 14px", borderRadius: 12, border: `2px solid ${selectedSize===s?"#d4af37":"rgba(212,175,55,0.2)"}`, background: selectedSize===s?"rgba(212,175,55,0.15)":T.surface2, color: selectedSize===s?"#d4af37":T.textMuted, cursor: "pointer", ...MF, fontSize: 14, fontWeight: selectedSize===s?700:400 }}>{s}</button>)}</div></div>; })()}
              <div style={{ background: T.surface, border: `1px solid ${T.borderCard}`, borderRadius: 16, padding: "14px 16px" }}>
                {[["🚚","Livraison partout en Algérie","Domicile ou Stop Desk"],["✅","Paiement à la livraison","Vous payez à la réception"]].map(([icon,title,sub]) => <div key={title} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 20 }}>{icon}</span><div style={{ ...MF }}><div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div><div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{sub}</div></div></div>)}
              </div>
            </div>
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.navBg, backdropFilter: "blur(16px)", borderTop: `1px solid ${T.border}`, padding: "14px 16px", zIndex: 20 }}>
              {selectedProduct.inStock===false ? <div style={{ padding: "14px 0", borderRadius: 30, background: T.surface2, color: T.textMuted, ...MF, fontSize: 15, fontWeight: 600, textAlign: "center" }}>🚫 Rupture de stock</div>
              : <button className="bg-gold" style={{ width: "100%", fontSize: 15, padding: "14px 0" }} onClick={e => { if ((selectedProduct.sizes?.length>0||selectedProduct.pointures?.length>0)&&!selectedSize) { alert("Veuillez choisir une taille"); return; } if (selectedProduct.colors?.length>0&&!selectedColor) { alert("Veuillez choisir une couleur"); return; } addToCart(selectedProduct,e,selectedSize,selectedColor); setSelectedSize(null); setSelectedColor(null); setSelectedProduct(null); setPhotoIndex(0); }}>🛒 Ajouter au panier</button>}
            </div>
          </div>
        );
      })()}

      {/* CART */}
      {cartOpen && <div className="ov" onClick={() => setCartOpen(false)}><div className="dr" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 20, fontWeight: 700 }}>Mon Panier 🛒</div><button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#d4af37", fontSize: 22, cursor: "pointer" }}>✕</button></div>
        {cart.length===0 ? <div style={{ textAlign: "center", padding: "40px 0", color: T.textFaint, ...MF }}><div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div><div>Votre panier est vide</div></div>
        : <>{cart.map(item => <div key={item.cartKey} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center", background: T.surface2, borderRadius: 14, padding: 10 }}>
          <img src={item.image} style={{ width: 60, height: 70, borderRadius: 10, objectFit: "cover" }} />
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.name}</div>{item.selectedSize&&<div style={{ fontSize: 11, color: "#d4af37", ...MF }}>Taille : {item.selectedSize}</div>}{item.selectedColor&&<div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: COULEURS.find(c=>c.label===item.selectedColor)?.hex||"#888" }} /><span style={{ fontSize: 11, color: "#d4af37", ...MF }}>{item.selectedColor}</span></div>}<div style={{ fontSize: 14, fontWeight: 700, color: "#d4af37", marginTop: 2 }}>{Number(item.price).toLocaleString()} DA</div></div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>{["+",item.qty,"−"].map((v,i) => i===1?<span key={i} style={{ ...MF, fontWeight: 700, fontSize: 14 }}>{v}</span>:<button key={i} onClick={() => updateQty(item.cartKey,i===0?1:-1)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#d4af37", cursor: "pointer", fontSize: 14 }}>{v}</button>)}</div>
          <button onClick={() => removeFromCart(item.cartKey)} style={{ background: "none", border: "none", color: T.textFaint, cursor: "pointer", fontSize: 16 }}>🗑</button>
        </div>)}
        <div className="gl" />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, ...MF }}><span>Total</span><span style={{ fontSize: 20, fontWeight: 700, color: "#d4af37" }}>{cartTotal.toLocaleString()} DA</span></div>
        <button className="bg-gold" style={{ width: "100%" }} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Commander maintenant →</button></>}
      </div></div>}

      {/* CHECKOUT */}
      {checkoutOpen && <div className="ov" onClick={() => setCheckoutOpen(false)}><div className="dr" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><div style={{ fontSize: 20, fontWeight: 700 }}>Livraison 📦</div><button onClick={() => setCheckoutOpen(false)} style={{ background: "none", border: "none", color: "#d4af37", fontSize: 22, cursor: "pointer" }}>✕</button></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[["NOM COMPLET","text","Ex: Amina Benali","name"],["TÉLÉPHONE","text","0555 123 456","phone"]].map(([l,t,ph,k]) => <div key={k}><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>{l}</div><input className="if" type={t} placeholder={ph} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} /></div>)}
          <div><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>WILAYA</div><select className="if" value={form.wilaya} onChange={e => setForm(f=>({...f,wilaya:e.target.value}))}><option value="">Sélectionner une wilaya...</option>{WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}</select></div>
          <div><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>ADRESSE COMPLÈTE</div><input className="if" placeholder="Rue, quartier, commune..." value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} /></div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 8 }}>MODE DE LIVRAISON</div>
            <div style={{ display: "flex", gap: 10 }}>{[["domicile","🏠 Domicile"],["stopdesk","🏪 Stop Desk"]].map(([m,label]) => { const tarif=WILAYAS_TARIFS[form.wilaya]; const prix=tarif?(m==="domicile"?tarif.domicile:tarif.stopdesk):null; return <button key={m} onClick={() => setForm(f=>({...f,delivery:m}))} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: `1.5px solid ${form.delivery===m?"#d4af37":"rgba(212,175,55,0.2)"}`, background: form.delivery===m?"rgba(212,175,55,0.1)":"transparent", color: form.delivery===m?"#d4af37":T.textMuted, cursor: "pointer", ...MF, fontSize: 12, fontWeight: 600, textAlign: "center" }}>{label}{prix!==null&&<div style={{ fontSize: 11, fontWeight: 700, color: form.delivery===m?"#d4af37":T.textFaint, marginTop: 3 }}>{prix===0?"Non disponible":`${prix.toLocaleString()} DA`}</div>}</button>; })}</div>
            {form.wilaya&&WILAYAS_TARIFS[form.wilaya]&&<div style={{ marginTop: 10, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 18 }}>⏱️</span><div style={{ ...MF, fontSize: 12 }}><span style={{ color: T.textMuted }}>Délai : </span><span style={{ color: "#d4af37", fontWeight: 700 }}>{WILAYAS_TARIFS[form.wilaya].delai}</span></div></div>}
          </div>
        </div>
        {formError&&<div style={{ color: "#ff6b6b", ...MF, fontSize: 12, marginTop: 10, textAlign: "center" }}>{formError}</div>}
        <div className="gl" />
        {form.wilaya&&WILAYAS_TARIFS[form.wilaya]&&<div style={{ background: T.surface2, borderRadius: 14, padding: "12px 16px", marginBottom: 12, ...MF }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 6 }}><span>Articles</span><span>{cartTotal.toLocaleString()} DA</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, marginBottom: 8 }}><span>Livraison</span><span style={{ color: "#d4af37" }}>{(() => { const p=form.delivery==="domicile"?WILAYAS_TARIFS[form.wilaya].domicile:WILAYAS_TARIFS[form.wilaya].stopdesk; return p===0?"Non disponible":`${p.toLocaleString()} DA`; })()}</span></div>
          <div style={{ height: 1, background: T.border, marginBottom: 8 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}><span>Total</span><span style={{ color: "#d4af37" }}>{(() => { const p=form.delivery==="domicile"?WILAYAS_TARIFS[form.wilaya].domicile:WILAYAS_TARIFS[form.wilaya].stopdesk; return (cartTotal+(p||0)).toLocaleString(); })()} DA</span></div>
        </div>}
        <button className="bg-gold" style={{ width: "100%", fontSize: 14 }} disabled={sendingOrder} onClick={handleOrder}>{sendingOrder?"⏳ Envoi en cours...":"✓ Confirmer la commande"}</button>
      </div></div>}

      {/* ADMIN */}
      {adminOpen && <div className="ov" onClick={() => { setAdminOpen(false); setAdminAuth(false); setAdminPassword(""); }}><div className="dr" style={{ maxHeight: "95vh" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div><div style={{ fontSize: 11, color: "rgba(212,175,55,0.6)", ...MF, letterSpacing: 2 }}>ACCÈS PRIVÉ</div><div style={{ fontSize: 20, fontWeight: 700 }}>⚙️ Panneau Admin</div></div>
          <button onClick={() => { setAdminOpen(false); setAdminAuth(false); setAdminPassword(""); }} style={{ background: "none", border: "none", color: "#d4af37", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {!adminAuth ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}><div style={{ fontSize: 50, marginBottom: 10 }}>🔒</div><div style={{ fontSize: 14, color: T.textMuted, ...MF }}>Mot de passe administrateur</div></div>
            <input className="if" type="password" placeholder="Mot de passe..." value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyDown={e => e.key==="Enter"&&handleAdminLogin()} style={{ marginBottom: 12 }} />
            {adminError&&<div style={{ color: "#ff6b6b", ...MF, fontSize: 12, marginBottom: 12, textAlign: "center" }}>{adminError}</div>}
            <button className="bg-gold" style={{ width: "100%" }} onClick={handleAdminLogin}>Accéder →</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
              {[["produits","🛍️ Produits"],["commandes","📦 Commandes"]].map(([id,label]) => <button key={id} className={`tb ${adminTab===id?"ac":""}`} onClick={() => { setAdminTab(id); setAdminSearchQuery(""); }} style={{ fontSize: 13 }}>{label}</button>)}
            </div>

            {adminTab==="produits" && (editingProduct===null ? (
              <div>
                <button className="bg-gold" style={{ width: "100%", marginBottom: 12, fontSize: 13 }} onClick={() => { setEditingProduct({}); setNewProduct(EMPTY_PRODUCT); }}>＋ Ajouter un produit</button>
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <input className="if" placeholder="🔍 Rechercher..." value={adminSearchQuery} onChange={e => setAdminSearchQuery(e.target.value)} />
                  {adminSearchQuery&&<button onClick={() => setAdminSearchQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontSize: 16 }}>✕</button>}
                </div>
                <div style={{ ...MF, fontSize: 12, color: T.textMuted, marginBottom: 12 }}>{products.filter(p => !adminSearchQuery || p.name?.toLowerCase().includes(adminSearchQuery.toLowerCase())).length} produits</div>
                {products.filter(p => !adminSearchQuery || p.name?.toLowerCase().includes(adminSearchQuery.toLowerCase()) || p.brand?.toLowerCase().includes(adminSearchQuery.toLowerCase())).map(p => (
                  <div key={p.id} className="ac2" style={{ borderColor: p.inStock===false?"rgba(255,80,80,0.3)":"rgba(212,175,55,0.15)" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img src={p.image} style={{ width: 52, height: 58, borderRadius: 10, objectFit: "cover", opacity: p.inStock===false?0.4:1 }} onError={e => e.target.style.display="none"} />
                        {p.inStock===false&&<div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(255,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>🚫</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                          {p.inStock===false&&<span style={{ background: "rgba(255,80,80,0.15)", color: "#ff6060", border: "1px solid rgba(255,80,80,0.3)", padding: "1px 7px", borderRadius: 10, fontSize: 9, ...MF, fontWeight: 700 }}>RUPTURE</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#d4af37", fontWeight: 700, ...MF }}>{Number(p.price).toLocaleString()} DA</div>
                        <div style={{ fontSize: 10, color: T.textMuted, ...MF }}>{CATEGORIES.find(c=>c.id===p.category)?.label}{p.gender?` · ${p.gender==="homme"?"👨 Homme":"👩 Femme"}`:""}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button onClick={() => toggleStock(p.id, p.inStock)} style={{ background: p.inStock===false?"rgba(100,200,100,0.1)":"rgba(255,80,80,0.1)", border: `1px solid ${p.inStock===false?"rgba(100,200,100,0.3)":"rgba(255,80,80,0.25)"}`, color: p.inStock===false?"#6dcc6d":"#ff6060", padding: "5px 10px", borderRadius: 20, cursor: "pointer", ...MF, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{p.inStock===false?"✅ En stock":"🚫 Rupture"}</button>
                        <button onClick={() => startEdit(p)} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: "#d4af37", padding: "5px 12px", borderRadius: 20, cursor: "pointer", ...MF, fontSize: 11, fontWeight: 600 }}>✏️ Edit</button>
                        <button onClick={() => deleteProduct(p.id)} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff6060", padding: "5px 12px", borderRadius: 20, cursor: "pointer", ...MF, fontSize: 11, fontWeight: 600 }}>🗑 Supp.</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <button onClick={() => { setEditingProduct(null); setNewProduct(EMPTY_PRODUCT); }} style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>‹</button>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{editingProduct?.id?"Modifier":"Nouveau produit"}</div>
                </div>

                {(newProduct.images?.length>0||newProduct.image)&&<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>{[newProduct.image,...(newProduct.images||[])].filter(Boolean).map((img,i) => <div key={i} style={{ position: "relative" }}><img src={img} style={{ width: 70, height: 80, objectFit: "cover", borderRadius: 10, border: i===0?"2px solid #d4af37":"1px solid rgba(212,175,55,0.2)" }} />{i===0&&<div style={{ position: "absolute", bottom: 2, left: 2, background: "#d4af37", color: "#0a0a0f", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 6, ...MF }}>MAIN</div>}</div>)}</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[["NOM DU PRODUIT *","text","Ex: Robe Élégante","name"],["MARQUE","text","Ex: LuxWear","brand"]].map(([label,type,ph,key]) => <div key={key}><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>{label}</div><input className="if" type={type} placeholder={ph} value={newProduct[key]||""} onChange={e => setNewProduct(p=>({...p,[key]:e.target.value}))} /></div>)}

                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>PRIX (DA) *</div><input className="if" type="number" placeholder="12000" value={newProduct.price||""} onChange={e => { const price=e.target.value; const oldP=newProduct.oldPrice; setNewProduct(p=>({...p,price,badge:(oldP&&price&&Number(oldP)>Number(price))?`-${Math.round((1-Number(price)/Number(oldP))*100)}%`:p.badge})); }} /></div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>ANCIEN PRIX (DA)</div><input className="if" type="number" placeholder="15000" value={newProduct.oldPrice||""} onChange={e => { const oldP=e.target.value; const price=newProduct.price; setNewProduct(p=>({...p,oldPrice:oldP,badge:(oldP&&price&&Number(oldP)>Number(price))?`-${Math.round((1-Number(price)/Number(oldP))*100)}%`:p.badge})); }} /></div>
                  </div>

                  <div><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>BADGE {newProduct.price&&newProduct.oldPrice&&Number(newProduct.oldPrice)>Number(newProduct.price)&&<span style={{ color: "#6dcc6d", fontWeight: 700 }}>✓ -{Math.round((1-Number(newProduct.price)/Number(newProduct.oldPrice))*100)}% auto</span>}</div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input className="if" placeholder="Ex: NEW ou EXCLU" value={newProduct.badge||""} onChange={e => setNewProduct(p=>({...p,badge:e.target.value}))} style={{ flex: 1 }} />{newProduct.badge&&<div style={{ background: G, color: "#0a0a0f", padding: "6px 12px", borderRadius: 20, ...MF, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{newProduct.badge}</div>}</div></div>

                  <div>
                    <div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>PHOTO PRINCIPALE * <span style={{ color: "rgba(240,236,228,0.4)", fontWeight: 400 }}>(lien imgbb.com)</span></div>
                    <input className="if" placeholder="https://i.ibb.co/..." value={newProduct.image||""} onChange={e => setNewProduct(p=>({...p,image:e.target.value}))} />
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 8 }}>PHOTOS SUPPLÉMENTAIRES <span style={{ color: T.textFaint, fontWeight: 400 }}>({(newProduct.images||[]).length} ajoutée{(newProduct.images||[]).length>1?"s":""})</span></div>
                    {(newProduct.images||[]).map((img,i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}><input className="if" placeholder={`https://i.ibb.co/... photo ${i+2}`} value={img} onChange={e => setNewProduct(p=>({...p,images:p.images.map((x,j)=>j===i?e.target.value:x)}))} style={{ flex: 1 }} /><button onClick={() => setNewProduct(p=>({...p,images:p.images.filter((_,j)=>j!==i)}))} style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff6060", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button></div>)}
                    <button onClick={() => setNewProduct(p=>({...p,images:[...(p.images||[]),""]})} style={{ width: "100%", padding: "9px 0", borderRadius: 20, border: "1.5px dashed rgba(212,175,55,0.35)", background: "transparent", color: "#d4af37", cursor: "pointer", ...MF, fontSize: 12, fontWeight: 600 }}>＋ Ajouter une photo</button>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 6 }}>CATÉGORIE *</div>
                    <select className="if" value={newProduct.category} onChange={e => setNewProduct(p=>({...p,category:e.target.value,sizes:[],pointures:[]}))}>
                      {CATEGORIES.filter(c=>c.id!=="all").map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 8 }}>GENRE</div>
                    <div style={{ display: "flex", gap: 10 }}>{[[null,"✦ Mixte"],["homme","👨 Homme"],["femme","👩 Femme"]].map(([g,label]) => <button key={String(g)} onClick={() => setNewProduct(p=>({...p,gender:g}))} style={{ flex: 1, padding: "8px 0", borderRadius: 20, border: `1.5px solid ${newProduct.gender===g?"#d4af37":"rgba(212,175,55,0.2)"}`, background: newProduct.gender===g?"rgba(212,175,55,0.12)":"transparent", color: newProduct.gender===g?"#d4af37":T.textMuted, cursor: "pointer", ...MF, fontSize: 12, fontWeight: newProduct.gender===g?700:500 }}>{label}</button>)}</div>
                  </div>

                  {(CAT_TAILLES.includes(newProduct.category)||newProduct.category==="casquettes")&&<div><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 8 }}>TAILLES <span style={{ color: T.textFaint, fontWeight: 400 }}>({(newProduct.sizes||[]).length} sélectionnées)</span></div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{(newProduct.category==="casquettes"?TAILLES_CASQUETTES:newProduct.category==="robes"?TAILLES_ROBES:TAILLES_VETEMENTS).map(s => { const active=(newProduct.sizes||[]).includes(s); return <button key={s} onClick={() => setNewProduct(p=>({...p,sizes:active?p.sizes.filter(x=>x!==s):[...(p.sizes||[]),s]}))} style={{ minWidth: 44, padding: "7px 10px", borderRadius: 10, border: `1.5px solid ${active?"#d4af37":"rgba(212,175,55,0.2)"}`, background: active?"rgba(212,175,55,0.15)":"transparent", color: active?"#d4af37":T.textMuted, cursor: "pointer", ...MF, fontSize: 13, fontWeight: active?700:400 }}>{s}</button>; })}</div></div>}
                  {CAT_POINTURES.includes(newProduct.category)&&<div><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 8 }}>POINTURES</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{POINTURES.map(s => { const active=(newProduct.pointures||[]).includes(s); return <button key={s} onClick={() => setNewProduct(p=>({...p,pointures:active?p.pointures.filter(x=>x!==s):[...(p.pointures||[]),s]}))} style={{ minWidth: 44, padding: "7px 10px", borderRadius: 10, border: `1.5px solid ${active?"#d4af37":"rgba(212,175,55,0.2)"}`, background: active?"rgba(212,175,55,0.15)":"transparent", color: active?"#d4af37":T.textMuted, cursor: "pointer", ...MF, fontSize: 13, fontWeight: active?700:400 }}>{s}</button>; })}</div></div>}
                  <div><div style={{ fontSize: 10, color: "rgba(212,175,55,0.7)", ...MF, letterSpacing: 1, marginBottom: 8 }}>COULEURS</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{COULEURS.map(c => { const active=(newProduct.colors||[]).includes(c.label); return <button key={c.label} onClick={() => setNewProduct(p=>({...p,colors:active?p.colors.filter(x=>x!==c.label):[...(p.colors||[]),c.label]}))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 20, border: `1.5px solid ${active?"#d4af37":"rgba(255,255,255,0.1)"}`, background: active?"rgba(212,175,55,0.1)":"transparent", cursor: "pointer" }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: c.hex, border: "1.5px solid rgba(255,255,255,0.2)" }} /><span style={{ ...MF, fontSize: 11, color: active?"#d4af37":T.textMuted, fontWeight: active?700:400 }}>{c.label}</span></button>; })}</div></div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button className="bg-gold" style={{ flex: 1 }} onClick={saveProduct}>{editingProduct?.id?"💾 Sauvegarder":"✅ Ajouter"}</button>
                  <button onClick={() => { setEditingProduct(null); setNewProduct(EMPTY_PRODUCT); }} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textMuted, padding: "12px 18px", borderRadius: 30, cursor: "pointer", ...MF, fontSize: 13 }}>Annuler</button>
                </div>
              </div>
            ))}

            {adminTab==="commandes" && (
              <div>
                {cancelledCount>0&&<div style={{ background: "rgba(255,68,68,0.1)", border: "1.5px solid rgba(255,68,68,0.35)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}><div style={{ fontSize: 22 }}>🚨</div><div style={{ ...MF }}><div style={{ fontSize: 13, fontWeight: 700, color: "#ff6060" }}>{cancelledCount} commande{cancelledCount>1?"s":""} annulée{cancelledCount>1?"s":""}!</div></div></div>}
                <div style={{ ...MF, fontSize: 12, color: T.textMuted, marginBottom: 16 }}>{allOrders.length} commande{allOrders.length!==1?"s":""} au total</div>
                {allOrders.length===0?<div style={{ textAlign: "center", padding: "40px 0", color: T.textFaint, ...MF }}><div style={{ fontSize: 40, marginBottom: 10 }}>📭</div><div>Aucune commande</div></div>
                :[...allOrders].sort((a,b) => { const r=s=>s==="Annulé"?0:s==="En attente"?1:2; return r(a.status)-r(b.status); }).map(o => {
                  const ss=statusStyle(o.status);
                  return <div key={o.id} className="ac2" style={o.status==="Annulé"?{borderColor:"rgba(255,68,68,0.4)",background:"rgba(255,68,68,0.04)"}:{}}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ ...MF }}><div style={{ fontSize: 13, fontWeight: 700, color: "#d4af37" }}>#{o.id.slice(-6)}</div><div style={{ fontSize: 11, color: T.textMuted }}>{o.date}</div></div>
                      <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: "3px 10px", borderRadius: 20, fontSize: 10, ...MF, fontWeight: 700 }}>{o.status==="Annulé"?"❌ ":""}{o.status}</span>
                    </div>
                    <div style={{ background: T.surface2, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                      <div style={{ ...MF, fontSize: 12 }}>
                        <div style={{ marginBottom: 3 }}>👤 <strong>{o.form?.name}</strong></div>
                        <div style={{ marginBottom: 3, color: T.textMuted }}>📞 {o.form?.phone}</div>
                        <div style={{ marginBottom: 3, color: T.textMuted }}>📍 {o.form?.wilaya} — {o.form?.address}</div>
                        <div style={{ color: T.textMuted }}>🚚 {o.form?.delivery==="domicile"?"Domicile":"Stop Desk"} · ⏱️ {o.livraisonDelai}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                      {o.items?.map((i,idx) => <div key={idx} style={{ position: "relative", textAlign: "center" }}><img src={i.image} style={{ width: 46, height: 52, borderRadius: 8, objectFit: "cover", display: "block" }} /><div style={{ position: "absolute", bottom: 2, right: 2, background: "#d4af37", color: "#0a0a0f", width: 15, height: 15, borderRadius: "50%", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i.qty}</div>{i.selectedSize&&<div style={{ fontSize: 9, color: "#d4af37", ...MF, fontWeight: 700 }}>{i.selectedSize}</div>}</div>)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ ...MF, fontSize: 12, color: T.textMuted }}>{o.items?.length} article{o.items?.length>1?"s":""}</span>
                      <span style={{ fontWeight: 700, color: "#d4af37", fontSize: 16 }}>{o.total?.toLocaleString()} DA</span>
                    </div>
                    <div style={{ ...MF, fontSize: 10, color: "rgba(212,175,55,0.7)", letterSpacing: 1, marginBottom: 8 }}>CHANGER LE STATUT</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {["En attente","Expédié","Livré","Annulé"].map(s => { const ss2=statusStyle(s); return <button key={s} onClick={() => updateOrderStatus(o.id,s)} style={{ padding: "5px 10px", borderRadius: 20, border: `1px solid ${o.status===s?ss2.color:"rgba(255,255,255,0.1)"}`, background: o.status===s?ss2.bg:"transparent", color: o.status===s?ss2.color:T.textMuted, cursor: "pointer", ...MF, fontSize: 10, fontWeight: 600 }}>{s==="En attente"?"⏳":s==="Expédié"?"🚚":s==="Livré"?"✅":"❌"} {s}</button>; })}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => window.open(`https://wa.me/${o.form?.phone?.replace(/\s/g,"")}?text=${encodeURIComponent(`Bonjour ${o.form?.name}, votre commande LuxWear #${o.id.slice(-6)} est confirmée ✓`)}`, "_blank")} style={{ flex: 1, padding: "8px 0", borderRadius: 20, border: "1px solid rgba(37,211,102,0.3)", background: "rgba(37,211,102,0.08)", color: "#25d366", cursor: "pointer", ...MF, fontSize: 11, fontWeight: 600 }}>💬 WhatsApp</button>
                      <button onClick={() => deleteOrder(o.id)} style={{ padding: "8px 14px", borderRadius: 20, border: "1px solid rgba(255,80,80,0.3)", background: "rgba(255,80,80,0.08)", color: "#ff6060", cursor: "pointer", ...MF, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>🗑 Supprimer</button>
                    </div>
                  </div>;
                })}
              </div>
            )}
          </div>
        )}
      </div></div>}
    </div>
  );
}
