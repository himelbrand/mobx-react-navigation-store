import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from '../components'
import { observer, inject } from 'mobx-react/native';

@inject('NavigationStore')
@observer
class ScreenFive extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        this.props.NavigationStore.setNavigation('NavOne',this.props.navigation)

        return (
            <View style={Style.container}>
                
                <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                    <Button style={Style.button} onPress={()=>{                        
                        this.props.NavigationStore.navigate({ routeName: 'NavOneFirst' })}}>
                        <Text style={Style.buttonText}>Screen 4</Text>
                    </Button>
                    <Button style={[Style.button,{backgroundColor:'#D89352'}]} onPress={()=>{                      
                        this.props.NavigationStore.navigate({ routeName: 'NestedNavigator' })}}>
                        <Text style={Style.buttonText}>Nested Tabs</Text>
                    </Button>
                </View>
            </View>
        )
    }

}
const Style = StyleSheet.create({
    container: {
        backgroundColor: '#60B2E5',
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
export default ScreenFive