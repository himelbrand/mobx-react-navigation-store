import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from '../components'
import { observer, inject } from 'mobx-react/native';

@inject('NavigationStore')
@observer
class ScreenSeven extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        this.props.NavigationStore.setNavigation('NavTwo',this.props.navigation)

        return (
            <View style={Style.container}>
                
            
                <Text style={Style.text}>Screen 7</Text>
            </View>
        )
    }

}
const Style = StyleSheet.create({
    container: {
        backgroundColor: '#E15634',
        flex: 1,
        justifyContent: 'space-around',
        alignItems:'center'
    },
    text: {
        fontSize: 35,
        color: 'white'
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
export default ScreenSeven