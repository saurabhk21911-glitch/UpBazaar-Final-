import { View, Text, Image, ScrollView } from 'react-native';

export default function App() {
  return (
    <View style={{flex:1, backgroundColor:'#fff', paddingTop:50}}>
      <View style={{backgroundColor:'#ff6a00', padding:15, alignItems:'center'}}>
        <Text style={{color:'#fff', fontSize:22, fontWeight:'bold'}}>UpBazaar</Text>
      </View>
      <ScrollView contentContainerStyle={{alignItems:'center', padding:20}}>
        <Image source={require('./assets/icon.png')} style={{width:120, height:120, borderRadius:20}} />
        <Text style={{marginTop:20, fontSize:18}}>APK Test Success Hai Bhai! ✅</Text>
        <Text style={{marginTop:10, color:'gray'}}>Agar ye dikh raha hai toh base OK hai</Text>
      </ScrollView>
    </View>
  );
}
