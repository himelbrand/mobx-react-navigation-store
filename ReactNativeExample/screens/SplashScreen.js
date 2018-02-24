import React, { Component } from 'react'
import {
    View,
    Text,
    ImageBackground,
    Dimensions,
    StyleSheet, 
    Animated,
    Easing
} from 'react-native';


class SplashScreen extends Component {
    constructor () {
		super()
		this.spinValue = new Animated.Value(0)
	}
	componentDidMount () {
		this.spin()
	}
	spin () {
		this.spinValue.setValue(0)
		Animated.timing(
			this.spinValue,
			{
				toValue: 1,
				duration: 4000,
				easing: Easing.linear
			}
		).start(() => this.spin())
	}
    
   
    render() {
        const spin = this.spinValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '360deg']
		})
        return  (
            <View style={styles.container}>
				<Text style={styles.title}>
          			React Native Navigation store
				</Text>
				<Animated.Image
					style={[styles.logo,{transform: [{rotate: spin}] }]}
					source={require('../assets/logo.png')}
				/>
			</View>
        ) 
    }
}
const styles = StyleSheet.create({
	container: {
        flex: 1,
        minWidth:'100%',
        minHeight:'100%',
		flexDirection:'column',
        //justifyContent: 'space-around',
        paddingTop:100,
		alignItems: 'center',
		flexWrap:'nowrap',
        backgroundColor: '#1a85ff',
        zIndex:200
	},
	title: {
		fontSize: 40,
		fontWeight: 'bold',
		textAlign: 'center',
        marginTop: 25,
        marginBottom:100,
		color: 'white'
	},
	bottomTitle:{
		margin:35,
		fontSize: 15,
		textAlign: 'center',
		color: '#b3d6ff'
	},
	logo:{
        resizeMode:'contain',
		width: 250,
		height: 250
	}
})
export default SplashScreen;