import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { inject, observer } from 'mobx-react/native'
import { Button } from '..'
import NavigationStore from 'mobx-react-navigation-store'

@observer
class Header extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const flag = NavigationStore.canGoBack
        return (
            <View style={Style.container}>
                <View style={{flexDirection:'row',justifyContent: flag ? 'flex-start' : 'center'}}>
                { flag ? 
                <Button style={Style.button} onPress={() => {
                    console.log(NavigationStore.AllNavigatorsStacks)
                    NavigationStore.goBack(true)
                }}>
                    <Text style={Style.buttonText}>{'<'}back</Text>
                </Button>: null }

                <Text style={[Style.title, flag ? {marginLeft:70} :{}]}>
                    {NavigationStore.CurrentRoute}
                </Text>
                </View>
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
        height:100,
        justifyContent:'center',
        backgroundColor:'#DFF3E4'
    },
    button:{
        alignSelf:'flex-start',
        width:75,
        height:50,
        justifyContent:'center',
        alignItems:'center'



    },
    buttonText:{
        fontSize:20
    }
})
export default Header