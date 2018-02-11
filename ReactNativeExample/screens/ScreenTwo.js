import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from '../components'
import { observer, inject } from 'mobx-react/native';

@inject('NavigationStore')
@observer
class ScreenTwo extends Component {
    constructor(props) {
        super(props)
    }
    static navigationOptions = {
        title: 'ScreenTwo',
      }
    render() {
        // this.props.NavigationStore.setNavigation('Main',this.props.navigation)
        return (
            <View style={Style.container}>
                <View style={{flexDirection:'row'}}>
                    <Button style={Style.button} onPress={()=>{                        
                        console.log(this.props.NavigationStore.CurrentRoute)                         
                        console.log(this.props.NavigationStore.ActiveNavigator)                         
                        this.props.NavigationStore.navigate({ routeName: 'MainFirst' })}}>
                        <Text style={Style.buttonText}>Screen 1</Text>
                    </Button>
                    <Button style={Style.button} onPress={()=>{                         
                        console.log(this.props.NavigationStore.CurrentRoute)                         
                        console.log(this.props.NavigationStore.ActiveNavigator)                         
                        this.props.NavigationStore.navigate({ routeName: 'MainThird' })}}>
                        <Text style={Style.buttonText}>Screen 3</Text>
                    </Button>
                    <Button style={[Style.button,{backgroundColor:'#B4D2BA'}]} onPress={()=>{                         
                        console.log(this.props.NavigationStore.CurrentRoute)                         
                        console.log(this.props.NavigationStore.ActiveNavigator)                         
                        this.props.NavigationStore.navigate({ routeName: 'NestedNavigator' })}}>
                        <Text style={Style.buttonText}>Screen 4</Text>
                    </Button>
                </View>
            </View>
        )
    }

}
const Style = StyleSheet.create({
    container: {
        backgroundColor: '#8ED081',
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
        borderWidth: 2,
        borderColor: "#ecebeb",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 40
    }
})
export default ScreenTwo