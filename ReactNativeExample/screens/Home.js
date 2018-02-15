import React, { Component } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Button } from '../components'
import { observer, inject } from 'mobx-react/native';

@inject('NavigationStore')
@observer
class Home extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <View style={Style.container}>
                    <Text>Home Screen</Text>
            </View>
        )
    }

}
const Style = StyleSheet.create({
    container: {
        backgroundColor: '#8ED081',
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    h1: {
        fontSize: 35,
        color: 'red',
    },
    text: {
        fontSize: 50,
        color: 'black',
        margin: 100,
        backgroundColor: 'blue'
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
export default Home