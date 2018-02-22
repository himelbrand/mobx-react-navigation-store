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
import NavigationStore, { DrawerNavigator } from 'mobx-react-navigation-store'
import { DrawerHome, SplashScreen, DrawerTwo } from '../screens'
import MainTabs from './MainTabs'
import { Header, Footer, DrawerButton } from '../components'
const hydrate = create({
    storage: AsyncStorage,
})
const stores = { NavigationStore }
const Drawer = DrawerNavigator('MainDrawer',
    {
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
    NavigationStore.setNavigators({
        MainDrawer: {
            type: 'drawer',
            nested: { NestedNavigatorTabs: 'MainTabs' },
            parent: null,
            shouldPersist: true,
            initRoute:'Home'
        },
        MainTabs: {
            type: 'tab',
            parent: 'MainDrawer',
            nested: { NestedNavigatorMain: 'Main' },
            shouldPersist: true,
            routes: ['Home', 'Two', 'NestedNavigatorMain'],
            initRoute:'Home'
        },
        Main: {
            type: 'stack',
            nested: { NestedNavigator: 'NavOne' },
            parent: 'MainTabs',
            initRoute:'MainFirst'
        },
        NavOne: {
            type: 'stack',
            parent: 'Main',
            nested: { NestedNavigator: 'NavTwo' },
            initRoute:'NavOneFirst'
        },
        NavTwo: {
            type: 'tab',
            parent: 'NavOne',
            routes: ['NavTwoFirst', 'NavTwoSecond'],
            initRoute:'NavTwoFirst'
        }
    },{
            initialNavigatorName: 'MainDrawer',
            order:['MainDrawer', 'MainTabs', 'Main', 'NavOne', 'NavTwo']
    })
    !NavigationStore.ActiveNavigator && NavigationStore.setActiveNavigator('MainDrawer')
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
        const splashDone = NavigationStore.storeHydrated
        return (
            <View style={{ flex: 1, justifyContent: 'space-around' }}>
                {!splashDone ? <SplashScreen /> : <DrawerButton />}
                {NavigationStore.startedStoreHydration && <Provider {...stores}>
                    <Drawer />
                </Provider>}

            </View>
        )
    }
}
export default Root