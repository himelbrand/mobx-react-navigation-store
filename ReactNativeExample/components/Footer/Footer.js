import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'

class Footer extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={Style.container}>
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
    
})
export default Footer