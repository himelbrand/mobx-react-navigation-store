import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions, TabNavigator } from 'react-navigation'
import { observer, Provider } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore from 'mobx-react-navigation-store'
import { Home, SplashScreen, Second } from '../screens'
import MainStack from './MainStack'
import { Header, Footer } from '../components'
const hydrate = create({
    storage: AsyncStorage,
})
const stores = { NavigationStore }
const Tabs = TabNavigator({
    Home: { screen: Home },
    Two: { screen: Second },
    NestedNavigatorMain: { 
        screen: MainStack
    }
}, {
        initialRouteName: 'Home',
        lazy: true,
        lazyLoad: true,
        backBehavior:'none'
    })
let hydrated = false
const result = hydrate('Nav', NavigationStore)
const rehydrate = result.rehydrate
result.then(() => {
    
    NavigationStore.setNavigator('MainTabs', 'Home', 'tab',{NestedNavigatorMain:'Main'}, null,true,['Home','Two','NestedNavigatorMain'])
    NavigationStore.setNavigator('Main', 'MainFirst', 'stack',{NestedNavigator:'NavOne'} ,'MainTabs')
    NavigationStore.setNavigator('NavOne', 'NavOneFirst', 'stack',{NestedNavigator:'NavTwo'} ,'Main')
    NavigationStore.setNavigator('NavTwo', 'NavTwoFirst', 'tab', null ,'NavOne', true,['NavTwoFirst','NavTwoSecond'])
    !NavigationStore.ActiveNavigator && NavigationStore.setActiveNavigator('MainTabs')
    NavigationStore.setInitialNavigator('MainTabs')
    setTimeout(() => NavigationStore.doneHydrating(), 1000)
    NavigationStore.StartedStoreHydration()
}).catch(error => console.log(error))



@observer
class Root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nowMounted: false,
            hydrated: false
        }
    }
    componentWillMount() {
        this.setState({ nowMounted: true })

    }
    componentDidMount() {
        if (NavigationStore.storeHydrated)
            NavigationStore.setActiveNavigator('MainTabs')

    }
    render() {
        const splashDone =  NavigationStore.storeHydrated
        return (
            <View style={{ flex: 1, justifyContent: 'space-around' }}>
                {!splashDone && <SplashScreen /> }
                {NavigationStore.startedStoreHydration && <Provider {...stores}>
                    <Tabs
                        ref={ref => {
                            if (ref && (!NavigationStore.getNavigator('MainTabs').navigation || this.state.nowMounted)) {
                                this.setState({ nowMounted: false })
                                try {
                                    console.log('set MainTabs Nav')
                                    NavigationStore.setNavigation('MainTabs', ref._navigation)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        }}
                        onNavigationStateChange={(oldState, newState, action) => {
                            try {
                                NavigationStore.handleAction('MainTabs', action,newState)

                            } catch (err) {
                                console.log(err)
                            }
                        }}
                        screenProps={{}}
                    />
                </Provider>}

            </View>
        )
    }
}
export default Root