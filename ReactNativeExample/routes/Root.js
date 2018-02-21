import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions, TabNavigator,DrawerNavigator } from 'react-navigation'
import { observer, Provider } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore from 'mobx-react-navigation-store'
import { DrawerHome, SplashScreen, DrawerTwo } from '../screens'
import MainTabs from './MainTabs'
import { Header, Footer, DrawerButton } from '../components'
const hydrate = create({
    storage: AsyncStorage,
})
const stores = { NavigationStore }
const Drawer = DrawerNavigator({
    Home: { screen: DrawerHome },
    Two: { screen: DrawerTwo },
    NestedNavigatorTabs: { 
        screen: MainTabs
    }
}, {
        initialRouteName: 'Home',
        lazy: true,
    })
let hydrated = false
const result = hydrate('Nav', NavigationStore)
const rehydrate = result.rehydrate
result.then(() => {
    NavigationStore.setNavigator('MainDrawer', 'Home', 'drawer',{NestedNavigatorTabs:'MainTabs'}, null,true)
    NavigationStore.setNavigator('MainTabs', 'Home', 'tab',{NestedNavigatorMain:'Main'}, null,true,['Home','Two','NestedNavigatorMain'])
    NavigationStore.setNavigator('Main', 'MainFirst', 'stack',{NestedNavigator:'NavOne'} ,'MainTabs')
    NavigationStore.setNavigator('NavOne', 'NavOneFirst', 'stack',{NestedNavigator:'NavTwo'} ,'Main')
    NavigationStore.setNavigator('NavTwo', 'NavTwoFirst', 'tab', null ,'NavOne', true,['NavTwoFirst','NavTwoSecond'])
    !NavigationStore.ActiveNavigator && NavigationStore.setActiveNavigator('MainDrawer')
    NavigationStore.setInitialNavigator('MainDrawer')
    NavigationStore.setOrder(['MainDrawer','MainTabs','Main','NavOne','NavTwo'])
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
            NavigationStore.setActiveNavigator('MainDrawer')

    }
    render() {
        const splashDone =  NavigationStore.storeHydrated
        return (
            <View style={{ flex: 1, justifyContent: 'space-around' }}>
                {!splashDone ? <SplashScreen /> : <DrawerButton/> }
                {NavigationStore.startedStoreHydration && <Provider {...stores}>
                    <Drawer
                        ref={ref => {
                            if (ref && (!NavigationStore.getNavigator('MainDrawer').navigation || this.state.nowMounted)) {
                                this.setState({ nowMounted: false })
                                try {
                                    console.log('set MainTabs Nav')
                                    NavigationStore.setNavigation('MainDrawer', ref._navigation)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        }}
                        onNavigationStateChange={(oldState, newState, action) => {
                            try {
                                NavigationStore.handleAction('MainDrawer', oldState, newState, action)

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