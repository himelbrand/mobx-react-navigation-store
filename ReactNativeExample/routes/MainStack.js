import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions, TabNavigator } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore from 'mobx-react-navigation-store'
import { ScreenOne, ScreenTwo, ScreenThree } from '../screens'
import NavigatorOne from './NavigatorOne'
import { Header, Footer } from '../components'

const Main = StackNavigator(
    {
        MainFirst: { screen: ScreenOne, title: 'MainFirst' },
        MainSecond: { screen: ScreenTwo, title: 'MainSecond' },
        MainThird: { screen: ScreenThree, title: 'MainThird' },
        NestedNavigator: { screen: NavigatorOne },
    }, {
        headerMode: 'none',
        lazy: true,
        initialRouteName: 'MainFirst',
    }

)

@inject('NavigationStore')
@observer
class MainStack extends Component {
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
        this.props.NavigationStore.setActiveNavigator('Main')
    }
    render() {
                return (
            <View style={{ flex: 1 }}>
                <Header />
                <Main
                    ref={ref => {
                        ////console.log(ref, this.props.NavigationStore.getNavigator('Main'))

                        if (ref && (!this.props.NavigationStore.getNavigator('Main').navigation || this.state.nowMounted)) {
                            this.setState({ nowMounted: false })
                            try {
                                //console.log('set Main Nav')
                                this.props.NavigationStore.setNavigation('Main', ref._navigation)
                            } catch (err) {
                                console.log(err)
                            }
                        }
                    }}
                    onNavigationStateChange={(oldState, newState, action) => {
                        try {
                            this.props.NavigationStore.handleAction('Main', action)

                        } catch (err) {
                            console.log(err)
                        }
                    }}
                />
                <Footer />
            </View>

        )
    }
}
export default MainStack