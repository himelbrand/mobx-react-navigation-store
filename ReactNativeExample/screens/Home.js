import React, { Component } from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { Button, Footer} from '../components'
import { observer, inject } from 'mobx-react/native';

@inject('NavigationStore')
@observer
class Home extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        //console.log(this.props)

        return (
            <View style={Style.container}>
                    <Text style={Style.text}
                    onPress={()=>{
                        console.log('home')
                        this.props.NavigationStore.navigate({routeName:'Two'})}}>Home Screen</Text>
                        <Footer/>
            </View>
        )
    }

}
const Style = StyleSheet.create({
    container: {
        backgroundColor: '#9BC53D',
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    text: {
        fontSize: 35,
        color: 'white',
        margin: 10,
        backgroundColor: 'transparent'
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