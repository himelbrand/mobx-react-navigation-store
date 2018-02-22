import React, { Component } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { inject, observer } from 'mobx-react/native'
import { Button } from '..'
import NavigationStore from 'rn-navigation-store'

@observer
class DrawerButton extends Component {
    constructor(props) {
        super(props)
        this.drwaerNav = NavigationStore.getNavigator('MainDrawer')
    }

    render() {
        return (
            <View style={Style.container}>
                <Button style={Style.button} onPress={() => {
                    this.drwaerNav.toggle()
                }}>
                                <Image source={require('../../assets/burger.png')} style={{resizeMode:'contain',width:50,height:50,zIndex:2}} />

                    {/* <Text style={Style.buttonText}>Drawer</Text> */}
                </Button>

            </View>
        )
    }
}
const Style = StyleSheet.create({
    title:{
        alignSelf:'center',
        textAlign:'center',
        fontSize:25,
    },
    container:{
        position:'absolute',
        top:30,
        right:10,
        zIndex:1
    },
    button:{
        height:60,
        width:60,
        borderRadius:30,
        justifyContent:'center',
        alignItems:'center'
    },
    buttonText:{
        fontSize:15
    }
})
export default DrawerButton