import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore,{TabNavigator} from 'mobx-react-navigation-store'
import { Home, Second } from '../screens'
import MainStack from './MainStack'
import { Header, Footer } from '../components'

const Tabs = TabNavigator('MainTabs',{
    Home: { screen: Home },
    Two: { screen: Second },
    NestedNavigatorMain: { 
        screen: MainStack
    }
}, {
        initialRouteName: 'Home',
        lazy: true,
        lazyLoad: true,
        backBehavior:'none',
        // navigationOptions:{
        //     tabBarOnPress:(nav) => {
        //         const navigator = NavigationStore.getNavigator('MainTabs')
        //         NavigationStore.setActiveNavigator('MainTabs')
        //         navigator.setJumpIndexFunction(nav.jumpToIndex)
        //         NavigationStore.navigate(nav.scene.route)
        //     }
        // }
    })

@inject('NavigationStore')
@observer
class MainTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nowMounted: false
        }
    }
    componentWillMount() {

    }
    componentDidMount() {
        this.setState({ nowMounted: true })
        this.props.NavigationStore.setActiveNavigator('MainTabs')
    }
    render() {
                return (
            <View style={{flex:1}}>
                <Tabs
                    // ref={ref => {
                    //     if (ref && (!this.props.NavigationStore.getNavigator('MainTabs').navigation || this.state.nowMounted)) {
                    //         this.setState({ nowMounted: false })
                    //         try {
                    //             this.props.NavigationStore.setNavigation('MainTabs', ref._navigation)
                    //         } catch (err) {
                    //             console.log(err)
                    //         }
                    //     }
                    // }}
                    // onNavigationStateChange={(oldState, newState, action) => {
                    //     try {
                    //         this.props.NavigationStore.handleAction('MainTabs', oldState, newState, action)

                    //     } catch (err) {
                    //         console.log(err)
                    //     }
                    // }}
                />
            </View>

        )
    }
}
export default MainTabs