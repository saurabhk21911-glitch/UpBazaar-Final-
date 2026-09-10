import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking, StyleSheet, ScrollView, FlatList, Dimensions, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
const { width, height } = Dimensions.get('window');
const ADMIN_PASS = "DishuRajvanshi7740";
const LOGO_URL = "https://i.postimg.cc/SRnbwx8q/file-000000007a98820887b7f176e5d5470c.png";
const TRACK_STEPS = ['Ordered','Packed','Shipped','Out for Delivery','Delivered'];

// --- 15KM LOCK CONSTANTS ---
const SITAPUR_LAT = 26.9194;
const SITAPUR_LNG = 80.6821;
const MAX_RADIUS_KM = 15;
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
 }
  const firebaseConfig = {
  apiKey: "AIzaSyA9ouZ2VJJME5vTCTnrsMfYg0uWGru606I",
  authDomain: "upbazaar.firebaseapp.com",
  projectId: "upbazaar",
  storageBucket: "upbazaar.firebasestorage.app",
  messagingSenderId: "1067850167185",
  appId: "1:1067850167185:web:1296d411abb89ab60b2030"
};
if (getApps().length === 0) { initializeApp(firebaseConfig); }
const CATEGORIES_DATA = [
  { id: 'Popular', name: 'Popular', icon: '⭐' },
  { id: 'Kurti, Saree & Lehenga', name: 'Kurti, Saree & Lehenga', icon: '👗' },
  { id: 'Women Western', name: 'Women Western', icon: '👚' },
  { id: 'Lingerie', name: 'Lingerie', icon: '👙' },
  { id: 'Men', name: 'Men', icon: '👕' },
  { id: 'Kids & Toys', name: 'Kids & Toys', icon: '🧸' },
  { id: 'Home & Kitchen', name: 'Home & Kitchen', icon: '🏠' },
  { id: 'Beauty & Health', name: 'Beauty & Health', icon: '💄' },
  { id: 'Jewellery & Accessories', name: 'Jewellery & Accessories', icon: '💍' },
  { id: 'Bags & Footwear', name: 'Bags & Footwear', icon: '👜' },
  { id: 'Electronics', name: 'Electronics', icon: '🎧' },
  { id: 'Watches', name: 'Watches', icon: '⌚' },
  { id: 'Sports & Fitness', name: 'Sports & Fitness', icon: '🏋️' },
  { id: 'Car & Motorbike', name: 'Car & Motorbike', icon: '🏍️' },
  { id: 'Office Supplies & Stationery', name: 'Office Supplies & Stationery', icon: '🎨' },
  { id: 'Grocery', name: 'Grocery', icon: '🛒' },
];
const SIZE_OPTIONS = {
  'Free Size': ['Free Size'],
  'Clothing S/M/L/XL/XXL': ['S','M','L','XL','XXL'],
  'Footwear 1-9': ['1','2','3','4','5','6','7','8','9'],
  'Kids 1-16 Years': ['1 Year','2 Years','3 Years','4 Years','5 Years','6 Years','7 Years','8 Years','9 Years','10 Years','11 Years','12 Years','13 Years','14 Years','15 Years','16 Years'],
};
const DEFAULT_BANNERS = [
  { id: 1, title: "Free Delivery", subtitle: "On Orders Above ₹199", color: "#ff6f00", emoji: "🚚" },
  { id: 2, title: "Mega Fashion Sale", subtitle: "50% OFF on Kurtis", color: "#e91e63", emoji: "🔥" },
  { id: 3, title: "UpBazaar Special", subtitle: "Lowest Price Guarantee", color: "#9c27b0", emoji: "💰" },
];const DEMO_REVIEWS = [
  { id:1, name:"Priya S.", rating:5, text:"Quality bahut achi hai, Sitapur me 5 ghante me aa gaya!", date:"2 din pehle" },
  { id:2, name:"Anjali M.", rating:4, text:"Watch bilkul photo jaisi hai, free return bhi hai", date:"1 hafta pehle" },
];
const DEMO_PRODUCTS = [
  { id: 1, name: "Red Check Top - Designer Top", price: 339, mrp: 599, category: "Women Western", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800", images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"], sizes: ['S','M','L','XL','XXL'], sizeType: 'Clothing S/M/L/XL/XXL', rating: "4.3", reviews: "1,234", delivery: "Free Delivery", returnDays: 7, reviewList: DEMO_REVIEWS },
];
export default function App() {
  const recaptchaVerifier = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [tab, setTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [shops, setShops] = useState([]);
  const [currentShop, setCurrentShop] = useState(null);
  const [showSupplierFlow, setShowSupplierFlow] = useState(false);
  const [supplierStep, setSupplierStep] = useState(1);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [shopMobile, setShopMobile] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCategoryCustom, setShopCategoryCustom] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [pan, setPan] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showBannerEdit, setShowBannerEdit] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [trackOrder, setTrackOrder] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdMrp, setNewProdMrp] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdImg1, setNewProdImg1] = useState('');
  const [newProdImg2, setNewProdImg2] = useState('');
  const [newProdImg3, setNewProdImg3] = useState('');
  const [newProdImg4, setNewProdImg4] = useState('');
  const [newProdImg5, setNewProdImg5] = useState('');
  const [newProdImg6, setNewProdImg6] = useState('');
  const [newProdImg7, setNewProdImg7] = useState('');
  const [newProdSizeType, setNewProdSizeType] = useState('Free Size');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [adminTab, setAdminTab] = useState('banner');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSub, setNewBannerSub] = useState('');
  const [newBannerColor, setNewBannerColor] = useState('#ff6f00');
  const [newBannerEmoji, setNewBannerEmoji] = useState('🚚');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const bannerRef = useRef(null);  const sendOtp = async () => {
    if(phone.length!== 10) return Alert.alert("10 digit mobile daalo");
    setOtpLoading(true);
    try {
      const auth = getAuth();
      const phoneProvider = new PhoneAuthProvider(auth);
      const verId = await phoneProvider.verifyPhoneNumber('+91'+phone, recaptchaVerifier.current);
      setVerificationId(verId);
      setShowOtpScreen(true);
      Alert.alert("OTP Bhej Diya! - "+phone);
    } catch(e) { Alert.alert("Error: "+e.message); }
    setOtpLoading(false);
  };
  const confirmOtp = async () => {
    if(otp.length!== 6) return Alert.alert("6 digit OTP daalo");
    setOtpLoading(true);
    try {
      const auth = getAuth();
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      const userData = { phone: phone, uid: result.user.uid };
      setCurrentUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setShowOtpScreen(false);
      Alert.alert("Login Ho Gaya! 🎉");
    } catch(e) { Alert.alert("Galat OTP: "+e.message); }
    setOtpLoading(false);
  };
  const logout = async () => { await AsyncStorage.removeItem('user'); setCurrentUser(null); setPhone(''); setOtp(''); setVerificationId(null); setShowOtpScreen(false); };
  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 3000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (bannerIndex + 1) % banners.length;
      setBannerIndex(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerIndex, banners.length]);
  useEffect(() => {
    (async () => {
      const savedBanners = await AsyncStorage.getItem('banners');
      if (savedBanners) setBanners(JSON.parse(savedBanners));
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      const savedShops = await AsyncStorage.getItem('shops');
      if (savedShops) setShops(JSON.parse(savedShops));
      const savedProducts = await AsyncStorage.getItem('products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      const savedCurrentShop = await AsyncStorage.getItem('currentShop');
      if (savedCurrentShop) setCurrentShop(JSON.parse(savedCurrentShop));
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    })();
  }, []);
  const saveBanners = async (nb) => { setBanners(nb); await AsyncStorage.setItem('banners', JSON.stringify(nb)); };
  const saveShops = async (ns) => { setShops(ns); await AsyncStorage.setItem('shops', JSON.stringify(ns)); };
  const saveProducts = async (np) => { setProducts(np); await AsyncStorage.setItem('products', JSON.stringify(np)); };
  const saveOrders = async (no) => { setOrders(no); await AsyncStorage.setItem('orders', JSON.stringify(no)); };
  const saveCurrentShop = async (shop) => { setCurrentShop(shop); await AsyncStorage.setItem('currentShop', JSON.stringify(shop)); };
  const getDiscount = (price, mrp) => { if(!mrp || mrp<=price) return 0; return Math.round(((mrp-price)/mrp)*100); };
  const getDeliveryInfo = (pincode) => {
    if(!pincode || pincode.startsWith('261')) return { text: "Aaj 7 ghante me aapke paas", sub: "Sitapur Local Delivery", color:"#16A34A", days: 0 };
    else return { text: "Kal tak delivery", sub: "All India", color:"#ff6f00", days: 1 };
  };  const getStatusIndex = (status) => { if(status==='Cancelled') return -1; const idx = TRACK_STEPS.indexOf(status); return idx===-1?0:idx; };
  const getInvoiceText = (order) => {
    if(!order) return "";
    const itemsText = order.items.map((it,i)=> (i+1)+". "+it.name+" | Size: "+it.selectedSize+" x "+it.qty+" = Rs "+(it.price*it.qty)).join("\n");
    return "UpBazaar INVOICE\nOrder: #"+order.id.toString().slice(-6)+"\nCustomer: "+order.customer?.name+" - "+order.customer?.mobile+"\nAddress: "+order.customer?.address+" - "+order.customer?.pincode+"\n"+itemsText+"\nTotal Rs "+order.total;
  };
  const pickImage = async (setFn) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status!== 'granted') { Alert.alert("Gallery permission do"); return; }
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled) { setFn(result.assets[0].uri); }
  };
  const addToCart = (p, size) => {
    const finalSize = size || (p.sizes && p.sizes[0]) || 'Free Size';
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id && i.selectedSize === finalSize);
      if (ex) return prev.map(i => i.id === p.id && i.selectedSize === finalSize? {...i, qty: i.qty + 1 } : i);
      return [...prev, {...p, qty: 1, selectedSize: finalSize }];
    });
  };
  const placeOrder = async () => {
    if (cart.length === 0) return;
    if (!customerName ||!customerMobile ||!customerAddress) return Alert.alert("Details bharo");
    if (customerMobile.length!==10) return Alert.alert("10 digit mobile daalo");

    // --- 15KM RADIUS CHECK START - YAHI NAYA HAI ---
    try{
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== 'granted') return Alert.alert("Location Do Bhai", "Delivery check ke liye location chahiye");
      let loc = await Location.getCurrentPositionAsync({});
      let dist = getDistanceKm(loc.coords.latitude, loc.coords.longitude, SITAPUR_LAT, SITAPUR_LNG);
      if(dist > MAX_RADIUS_KM){
        return Alert.alert("Sorry Bhai ❤️", `Aap ${dist.toFixed(1)}km dur ho. Abhi hum sirf Sitapur 15km me delivery dete hain. Aapka order save hai, jaldi aayenge!`);
      }
    } catch(e){
      console.log("Location fail", e);
      if(!customerPincode.startsWith('261')) return Alert.alert("Delivery Sirf Sitapur 15km Me Hai");
    }
    // --- 15KM LOCK END ---

    const deliveryInfo = getDeliveryInfo(customerPincode);
    const newOrder = { id: Date.now(), items: cart, date: new Date().toLocaleDateString(), status: 'Ordered', total: cart.reduce((s, i) => s + i.price * i.qty, 0), customer: { name: customerName, mobile: customerMobile, address: customerAddress, pincode: customerPincode }, deliveryInfo: deliveryInfo, orderTime: new Date().toLocaleTimeString() };
    await saveOrders([newOrder,...orders]); setCart([]); setShowCheckout(false); setTab('orders');
    const itemsDetail = cart.map(it => it.name + " | Size:" + it.selectedSize + " x" + it.qty).join(", ");
    const fullMsg = "🔥 NEW ORDER - UpBazaar 🔥\n\nOrder ID: #"+newOrder.id.toString().slice(-6)+"\nDate: "+newOrder.date+" "+newOrder.orderTime+"\n\nCustomer Details:\nName: "+customerName+"\nMobile: "+customerMobile+"\nAddress: "+customerAddress+"\nPincode: "+customerPincode+"\nDelivery: "+deliveryInfo.text+" - "+deliveryInfo.sub+"\n\nItems:\n"+itemsDetail+"\n\nTotal Payable: Rs "+newOrder.total+"\n\n";
    setCustomerName(''); setCustomerMobile(''); setCustomerAddress(''); setCustomerPincode('');
    Linking.openURL("https://wa.me/919235711539?text="+encodeURIComponent(fullMsg));
  };
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Popular' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseConfig} attemptInvisibleVerification={true} />
      {!currentUser &&!showSplash? (
        <View style={{flex:1, backgroundColor:'white', padding:20, justifyContent:'center'}}>
          <Image source={{ uri: LOGO_URL }} style={{ width: 120, height: 120, alignSelf:'center' }} resizeMode="contain" />
          <Text style={{fontSize:26, fontWeight:'bold', textAlign:'center', marginTop:10, color:'#ff6f00'}}>UpBazaar Login</Text>
          <Text style={{textAlign:'center', color:'gray', marginTop:5}}>OTP se Login Karo - Safe Hai - Reset Nahi Hoga</Text>
          {!showOtpScreen? (
            <View style={{marginTop:30}}>
              <Text style={{fontWeight:'bold'}}>Mobile Number</Text>
              <View style={{flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#ddd', borderRadius:10, marginTop:8, paddingHorizontal:12}}>
                <Text style={{fontWeight:'bold'}}>+91</Text>
                <TextInput placeholder="10 digit number" keyboardType="phone-pad" maxLength={10} style={{flex:1, padding:14}} value={phone} onChangeText={setPhone} />
              </View>
              <TouchableOpacity onPress={sendOtp} disabled={otpLoading} style={{backgroundColor:'#16A34A', padding:16, borderRadius:12, marginTop:20, alignItems:'center'}}>
                <Text style={{color:'white', fontWeight:'bold', fontSize:16}}>{otpLoading? "OTP Bhej Rahe..." : "OTP Bhejo →"}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{marginTop:30}}>
              <Text style={{fontWeight:'bold'}}>OTP Daalo - {phone} pe bheja</Text>
              <TextInput placeholder="6 digit OTP" keyboardType="number-pad" maxLength={6} style={{borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:14, marginTop:10, fontSize:18, letterSpacing:10, textAlign:'center'}} value={otp} onChangeText={setOtp} />
              <TouchableOpacity onPress={confirmOtp} disabled={otpLoading} style={{backgroundColor:'#ff6f00', padding:16, borderRadius:12, marginTop:20, alignItems:'center'}}>
                <Text style={{color:'white', fontWeight:'bold', fontSize:16}}>{otpLoading? "Check Kar Rahe..." : "Login Karo ✅"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=> setShowOtpScreen(false)} style={{marginTop:15, alignItems:'center'}}><Text style={{color:'#ff6f00'}}>Number Badlo?</Text></TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
      <>
      {tab === 'home' &&!showSplash && (
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#ff6f00', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontWeight: 'bold' }}>Up</Text></View>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>UpBazaar - Sitapur 15km Only</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setTab('wishlist')} style={{ marginRight: 12 }}><Ionicons name="heart-outline" size={24} color="black" />{wishlist.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{wishlist.length}</Text></View>}</TouchableOpacity>
              <TouchableOpacity onPress={() => setTab('cart')} style={{ marginRight: 12 }}><Ionicons name="cart-outline" size={24} color="black" />{cart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cart.reduce((s, i) => s + i.qty, 0)}</Text></View>}</TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAdminLogin(true)} style={{ backgroundColor: '#111', padding: 6, borderRadius: 20 }}><Ionicons name="shield-checkmark" size={20} color="white" /></TouchableOpacity>
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{paddingBottom: 90}}>
            <View style={{ padding: 12 }}><View style={styles.searchBox}><Ionicons name="search" size={20} color="gray" /><TextInput placeholder="Search for Sarees, Kurtis..." style={{ flex: 1, marginLeft: 8 }} value={search} onChangeText={setSearch} /></View></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 12 }}>
              {CATEGORIES_DATA.map(cat => (
                <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(cat.id)} style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}>
                  <Text style={{ fontSize: 20 }}>{cat.icon}</Text><Text style={[styles.catText, selectedCategory === cat.id && { color: '#ff6f00' }]} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ height: 150, marginTop: 15 }}>
              <FlatList ref={bannerRef} data={banners} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={item => item.id.toString()} onMomentumScrollEnd={(e) => { const idx = Math.round(e.nativeEvent.contentOffset.x / width); setBannerIndex(idx); }}
                renderItem={({ item }) => (<View style={[styles.banner, { backgroundColor: item.color, width: width - 24, marginHorizontal: 12 }]}><View><Text style={styles.bannerTitle}>{item.emoji} {item.title}</Text><Text style={styles.bannerSub}>{item.subtitle}</Text></View><Ionicons name="chevron-forward" size={30} color="white" /></View>)}
              />
              <View style={{ flexDirection: 'row', justifyContent:'center', marginTop:8 }}>
                {banners.map((_,i)=> <View key={i} style={[styles.dot, i===bannerIndex && styles.dotActive]} />)}
              </View>
            </View>            <View style={styles.productGrid}>
              {filteredProducts.map(p=>(
                <TouchableOpacity key={p.id} onPress={()=> {setSelectedProduct(p); setSelectedImgIndex(0); setSelectedSize(p.sizes? p.sizes[0] : 'Free Size');}} style={styles.productCard}>
                  <Image source={{uri: p.img}} style={styles.productImg} />
                  <Text style={styles.pName} numberOfLines={2}>{p.name}</Text>
                  <View style={{flexDirection:'row', alignItems:'center', marginTop:4}}><Text style={styles.pPrice}>₹{p.price}</Text><Text style={styles.pMrp}>₹{p.mrp}</Text><Text style={{fontSize:10, color:'#16A34A', fontWeight:'bold', marginLeft:4}}>{getDiscount(p.price,p.mrp)}% OFF</Text></View>
                  <TouchableOpacity onPress={()=> addToCart(p)} style={{backgroundColor:'#ff6f00', padding:8, borderRadius:6, marginTop:6, alignItems:'center'}}><Text style={{color:'white', fontWeight:'bold', fontSize:12}}>Add to Cart</Text></TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
      {/* YAHAN SE TERA BAAKI KA CODE SAME HAI - CART, ORDERS, WISHLIST, ACCOUNT SAB */}
      {/* Admin Panel - Safe Hai */}
      <Modal visible={showAdminPanel} animationType="slide">
        <View style={{flex:1, backgroundColor:'white', paddingTop:40}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', padding:15, borderBottomWidth:1, borderColor:'#eee'}}><Text style={{fontWeight:'bold', fontSize:18}}>Admin Panel - Reset Nahi Hoga ✅</Text><TouchableOpacity onPress={()=> setShowAdminPanel(false)}><Ionicons name="close" size={26} /></TouchableOpacity></View>
          <View style={{flexDirection:'row', padding:10, gap:8, flexWrap:'wrap'}}>
            {['banner','product','order','shop','users'].map(t=> <TouchableOpacity key={t} onPress={()=> setAdminTab(t)} style={{padding:10, backgroundColor: adminTab===t? '#ff6f00' : '#eee', borderRadius:8}}><Text style={{color: adminTab===t? 'white' : 'black', fontWeight:'bold', fontSize:12}}>{t.toUpperCase()}</Text></TouchableOpacity>)}
          </View>
          <ScrollView style={{flex:1, padding:15}} contentContainerStyle={{paddingBottom:100}}>
            {adminTab==='product' && (<View><Text style={{fontWeight:'bold'}}>Products - {products.length}</Text>{products.map(p => <View key={p.id} style={{ padding: 12, backgroundColor: '#f9f9f9', borderRadius: 10, marginTop: 10 }}><View style={{flexDirection:'row', justifyContent:'space-between'}}><Text style={{fontWeight:'bold', fontSize:12, flex:1}}>{p.name} - {getDiscount(p.price,p.mrp)}% OFF</Text><TouchableOpacity onPress={() => { const np = products.filter(x => x.id!== p.id); saveProducts(np); }} style={{ backgroundColor: 'red', padding: 6, borderRadius: 6 }}><Text style={{ color: 'white', fontSize: 11 }}>Delete</Text></TouchableOpacity></View></View>)}</View>)}
            {adminTab==='order' && (<View><Text style={{fontWeight:'bold'}}>Orders - {orders.length} - Full Address</Text>{orders.map(o=> <View key={o.id} style={{padding:12, backgroundColor:'white', borderRadius:10, marginTop:10, borderWidth:1, borderColor: o.status==='Cancelled'? 'red' : '#16A34A'}}><Text style={{fontWeight:'bold', fontSize:12}}>Order #{o.id.toString().slice(-6)} - {o.status} - Rs {o.total}</Text><Text style={{fontSize:11, marginTop:4, fontWeight:'bold'}}>{o.customer?.name} - {o.customer?.mobile}</Text><Text style={{fontSize:10, color:'gray'}}>{o.customer?.address} - {o.customer?.pincode}</Text></View>)}</View>)}
            {adminTab==='shop' && <View><Text style={{fontWeight:'bold'}}>Shops - {shops.length}</Text>{shops.map(s => <View key={s.id} style={{ padding: 12, backgroundColor: '#F0FFF4', borderRadius: 8, marginTop: 10 }}><Text style={{fontWeight:'bold'}}>{s.shopName} - {s.mobile}</Text><Text style={{fontSize:11}}>{s.address}</Text></View>)}</View>}
            {adminTab==='users' && <View><Text style={{fontWeight:'bold'}}>Users - Sale: Rs {orders.reduce((s,o)=> s+o.total,0)}</Text><Text style={{marginTop:10, fontSize:12}}>Total Orders: {orders.length} - Safe Hai - Reset Nahi Hoga</Text><Text style={{fontSize:12}}>Total Products: {products.length}</Text></View>}
          </ScrollView>
        </View>
      </Modal>      <Modal visible={showCheckout} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 45, padding: 15, borderBottomWidth:1, borderColor:'#eee' }}>
            <TouchableOpacity onPress={() => setShowCheckout(false)}><Ionicons name="arrow-back" size={26} color="black" /></TouchableOpacity><Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 12 }}>Delivery - Sitapur 15km Only</Text>
          </View>
          <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{paddingBottom: 120}}>
            <TextInput placeholder="Apna Naam *" style={styles.sellerInput} value={customerName} onChangeText={setCustomerName} />
            <TextInput placeholder="Mobile Number - 10 digit *" keyboardType="phone-pad" maxLength={10} style={styles.sellerInput} value={customerMobile} onChangeText={setCustomerMobile} />
            <TextInput placeholder="Pura Address - Mohalla, Gola Road *" style={[styles.sellerInput, { height: 90, textAlignVertical:'top' }]} multiline value={customerAddress} onChangeText={setCustomerAddress} />
            <TextInput placeholder="Pincode - 261001 (Sitapur = 7 Ghante)" keyboardType="number-pad" maxLength={6} style={styles.sellerInput} value={customerPincode} onChangeText={setCustomerPincode} />
            {customerPincode.length===6 && (()=>{ const info=getDeliveryInfo(customerPincode); return <View style={{marginTop:10, padding:12, backgroundColor: info.color+'20', borderRadius:8, borderWidth:1, borderColor: info.color}}><Text style={{fontWeight:'bold', color: info.color}}>🚚 {info.text} - {info.sub}</Text></View> })()}
            <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10 }}>
              <Text style={{fontWeight:'bold'}}>Items:</Text>
              {cart.map((c,i)=><Text key={i} style={{fontSize:11, marginTop:4}}>• {c.name} | Size:{c.selectedSize} x{c.qty} = Rs{c.price*c.qty}</Text>)}
              <Text style={{fontWeight:'bold', marginTop:10}}>Payable: Rs {cart.reduce((s,i)=> s+i.price*i.qty,0)}</Text>
            </View>
            <TouchableOpacity onPress={placeOrder} style={[styles.sendBtn, {backgroundColor:'#16A34A', marginTop:20}]}><Text style={styles.sendBtnText}>Confirm Order - 15km Check ✓</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      {showSplash && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: width, height: height, zIndex: 10000, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
          <Image source={{ uri: LOGO_URL }} style={{ width: 260, height: 260 }} resizeMode="contain" />
          <Text style={{ marginTop: 15, fontSize: 32, fontWeight: 'bold', color: '#ff6f00' }}>UpBazaar</Text>
          <Text style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>Sitapur 15km Only • Reset Nahi Hoga ✅</Text>
        </View>
      )}
      </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 45, paddingBottom: 12, paddingHorizontal: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  catChip: { alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 10, marginRight: 10, width: 80, borderWidth: 1, borderColor: '#eee' },
  catChipActive: { borderColor: '#ff6f00', backgroundColor: '#FFF7ED' },
  catText: { fontSize: 10, textAlign: 'center', marginTop: 4 },
  banner: { height: 120, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  bannerSub: { color: 'white', fontSize: 12, marginTop: 4, opacity: 0.9 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ccc', marginHorizontal: 3 },
  dotActive: { backgroundColor: '#ff6f00', width: 20 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 6, paddingBottom: 20 },
  productCard: { width: (width - 24) / 2, backgroundColor: 'white', borderRadius: 10, padding: 8, margin: 6, borderWidth: 1, borderColor: '#eee' },
  productImg: { width: '100%', height: 160, borderRadius: 8, backgroundColor: '#f0f0f0' },
  pName: { fontSize: 12, marginTop: 6, height: 32 },
  pPrice: { fontWeight: 'bold', fontSize: 14 },
  pMrp: { color: 'gray', fontWeight: 'normal', textDecorationLine: 'line-through', fontSize: 11, marginLeft: 6 },
  sellerInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginTop: 12, backgroundColor: 'white' },
  sendBtn: { backgroundColor: '#ff6f00', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  sendBtnText: { color: 'white', fontWeight: 'bold' },
  badge: { position: 'absolute', top: -6, right: -8, backgroundColor: 'red', borderRadius: 10, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});
