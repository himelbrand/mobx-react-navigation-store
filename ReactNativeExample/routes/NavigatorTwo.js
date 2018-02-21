import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import { create } from 'mobx-persist'
import { ScreenSix, ScreenSeven } from '../screens'
import NavigationStore from 'mobx-react-navigation-store'

const NavTwo = TabNavigator(
    {
        NavTwoFirst: { screen: ScreenSix,title:'NavTwoFirst' },
        NavTwoSecond: { screen: ScreenSeven ,title:'NavTwoSecond'},
    }, {
        headerMode: 'none',
        lazy: true,
        initialRouteName: 'NavTwoFirst',
        tabBarPosition: 'top',
        navigationOptions:{
            tabBarOnPress:(nav) => {
                console.log('gdsgsgsgsdsgsgsgdg',nav,NavigationStore)
                const navigator = NavigationStore.getNavigator('NavTwo')
                navigator.setJumpIndexFunction(nav.jumpToIndex)
                NavigationStore.navigate(nav.scene.route)
            }
        }

    }
)

@inject('NavigationStore')
@observer
class NavigatorTwo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nowMounted: false
        }
    }
    componentWillMount() {
    }
    componentDidMount(){
        this.setState({ nowMounted: true })

        this.props.NavigationStore.setActiveNavigator('NavTwo')
    }
    render(){
        return (
                <NavTwo
                ref={ref => {
                    if(ref && ((this.props.NavigationStore.getNavigator('NavTwo') &&  !this.props.NavigationStore.getNavigator('NavTwo').navigation)|| this.state.nowMounted)){
                        this.setState({nowMounted:false})
                        this.props.NavigationStore.setNavigation('NavTwo',ref._navigation)
                    }
                }}
                onNavigationStateChange={(oldState,newState,action) => {
                    this.props.NavigationStore.handleAction('NavTwo',action,newState)
                }}
                
                />
        )
    }
}
export default NavigatorTwo