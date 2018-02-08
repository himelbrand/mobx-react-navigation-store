import React, { Component } from 'react'
import {
    View,
    Text,
    ImageBackground,
    Dimensions,
    StyleSheet
} from 'react-native';


class SplashScreen extends Component {
    constructor() {
        super()
        this.state = {
            dots: ''
        }
        this.interval = null
        this.dotCount = 0
    }
    componentDidMount() {
        this.interval = setInterval(() => {
            this.dotCount = (this.dotCount + 1) % 4
            switch (this.dotCount) {
                case 0:
                    this.setState({dots: ''})
                    break;
                case 1:
                    this.setState({dots: '.'})
                    break;
                case 2:
                    this.setState({dots: '..'})
                    break;
                case 3:
                    this.setState({dots: '...'})
                    break;
                default:
                    break;
            }
        },250)
    }
    componentWillUnmount() {
        clearInterval(this.interval)
    }
    render() {
        return (
            <ImageBackground style={Style.image_background} resizeMode='cover' source={require('../assets/splashBG.jpg')}>
                <View style={Style.container}>
                    <Text style={Style.text}>
                        Loading{this.state.dots}
                    </Text>
                </View>
            </ImageBackground>
        )
    }
}
const Style = StyleSheet.create({
    image_background: {
        flex: 1,
        minHeight: '100%',
        minWidth: '100%'
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontSize: 40,
        color:'white'
    }
})
export default SplashScreen;