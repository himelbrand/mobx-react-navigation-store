import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { NavigationActions, TabNavigator } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore, { StackNavigator } from 'rn-navigation-store'
import { ScreenOne, ScreenTwo, ScreenThree } from '../screens'
import NavigatorOne from './NavigatorOne'
import { Header, Footer } from '../components'
//NavigationStore.setNavigator('Main', 'MainFirst', 'stack', { NestedNavigator: 'NavOne' }, 'MainTabs')

const Main = StackNavigator('Main',
    {
        MainFirst: { screen: ScreenOne, title: 'MainFirst' },
        MainSecond: { screen: ScreenTwo, title: 'MainSecond' },
        MainThird: { screen: ScreenThree, title: 'MainThird' },
        NestedNavigator: { screen: NavigatorOne }
    }, {
        headerMode: 'none',
        lazy: true,
        initialRouteName: 'MainFirst'
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
                <Main />
                <Footer />
            </View>

        )
    }
}
export default MainStack