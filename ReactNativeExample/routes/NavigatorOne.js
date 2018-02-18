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
import { ScreenFour, ScreenFive } from '../screens'
import NavigatorTwo from './NavigatorTwo'


const NavOne = StackNavigator(
    {
        NavOneFirst: { screen: ScreenFour, title:'NavOneFirst' },
        NavOneSecond: { screen: ScreenFive, title:'NavOneSecond' },
        NestedNavigator: { screen: NavigatorTwo },
    }, {
       headerMode: 'none',
        lazy: true,
        initialRouteName: 'NavOneFirst',
    }
)

@inject('NavigationStore')
@observer
class NavigatorOne extends Component {
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
        this.props.NavigationStore.setActiveNavigator('NavOne')
    }
    render(){
        //console.log(this.state.nowMounted)
        return (
            
            <NavOne
                ref={ref => {
                    if(ref && ((this.props.NavigationStore.getNavigator('NavOne') && !this.props.NavigationStore.getNavigator('NavOne').navigation) || this.state.nowMounted)){
                        this.setState({nowMounted:false})
                        this.props.NavigationStore.setNavigation('NavOne',ref._navigation)
                    }
                }}
                onNavigationStateChange={(oldState,newState,action) => {
                    this.props.NavigationStore.handleAction('NavOne',action)
                }}
                />
            
        )
    }
}
export default NavigatorOne