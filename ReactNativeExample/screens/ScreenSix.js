import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from '../components'
import { observer, inject } from 'mobx-react/native';

@inject('NavigationStore')
@observer
class ScreenSix extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        this.props.NavigationStore.setNavigation('NavTwo',this.props.navigation)

        return (
            <View style={Style.container}>
                
                <Text style={Style.text}>{this.props.NavigationStore.CurrentRoute}</Text>
                <Button style={Style.button} onPress={()=>{                        
                        console.log(this.props.NavigationStore.CurrentRoute)                         
                        console.log(this.props.NavigationStore.ActiveNavigator)                         
                        let ans =this.props.navigation.goBack()                       
                        console.log('ans',ans)
                          if(!ans)
                            this.props.NavigationStore.goBack(true)}}>
                        <Text style={Style.buttonText}>go Back</Text>
                    </Button>
                <View>
                    <Button style={Style.button} onPress={()=>{                         
                        console.log(this.props.NavigationStore.CurrentRoute)                         
                        console.log(this.props.NavigationStore.ActiveNavigator)                         
                        this.props.NavigationStore.navigate({ routeName: 'NavTwoSecond' })}}>
                        <Text style={Style.buttonText}>Screen 7</Text>
                    </Button>
                </View>
            </View>
        )
    }

}
const Style = StyleSheet.create({
    container: {
        backgroundColor: 'pink',
        flex: 1,
        justifyContent: 'space-around'
    },
    h1: {
        fontSize: 35,
        color: 'red'
    },
    text: {
        fontSize: 20,
        color: '#003344'
    },
    button: {
        width: 100,
        height: 75,
        margin: 20,
        borderWidth: 1,
        borderColor: "#ecebeb",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40
    }
})
export default ScreenSix