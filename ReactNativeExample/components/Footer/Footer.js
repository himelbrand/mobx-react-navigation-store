import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import NavigationStore from 'rn-navigation-store'
import {Button} from '..'
class Footer extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={Style.container}>
            <Button style={Style.button} onPress={()=>NavigationStore.logout()}>
                <Text style={Style.title}>RESET</Text>
            </Button>
                <Text style={Style.title}>Created by @himelbrand</Text>
                <Text style={Style.title}>powered by React Native</Text>
            </View>
        )
    }
}
const Style = StyleSheet.create({
    title:{
        alignSelf:'center',
        textAlign:'center',
        color:'white',
        fontSize:15,
        backgroundColor:'transparent'
    },
    container:{
        position:'absolute',
        bottom:25,
        justifyContent:'center',
        zIndex:200,
        alignSelf:'center'
    },
    button:{
        borderWidth:1,
        marginBottom:10,
        minWidth:60,
        alignSelf:'center',
        padding:10
    }
    
})
export default Footer