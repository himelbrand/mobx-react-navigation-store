import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions,TabNavigator } from 'react-navigation'
import { observer, Provider } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore from 'mobx-react-navigation-store'
import { Home, SplashScreen } from '../screens'
import MainStack from './MainStack'
import {Header, Footer} from '../components'
const hydrate = create({
    storage: AsyncStorage
})
const stores = { NavigationStore }
const Tabs = TabNavigator({
    Home: {screen:Home},
    Two: {screen:Home},
    NestedNavigatorMain:{screen: MainStack}
},{
    initialRouteName: 'Home',
    lazy:true,
    lazyLoad:true
})

    

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
        hydrate('navigation', NavigationStore).then(() => {
            try {
                NavigationStore.setNavigator('MainTabs','Home','tab',null,false,['Home','Two','NestedNavigatorMain'])
                NavigationStore.setNavigator('Main', 'MainFirst','stack','MainTabs')
                NavigationStore.setNavigator('NavOne','NavOneFirst','stack','Main')
                NavigationStore.setNavigator('NavTwo','NavTwoFirst','stack','NavOne',false)
                if (!NavigationStore.ActiveNavigator)
                    NavigationStore.setActiveNavigator('MainTabs')
                NavigationStore.setInitialNavigator('MainTabs')
            } catch (err) {
                console.log(err)
            }
            this.setState({hydrated:true})
            setTimeout(()=>NavigationStore.doneHydrating(),1000)
            
        }).catch(error => console.log(error))
    }
    componentDidMount(){
        if(NavigationStore.storeHydrated)
            NavigationStore.setActiveNavigator('MainTabs')

    }
    render() {
        const splashDone = NavigationStore.storeHydrated
        console.log(NavigationStore.ActiveNavigator)
        return (
            <View style={{ flex: 1, justifyContent: 'space-around' }}>
                {!splashDone && <SplashScreen /> }
                {this.state.hydrated && <Provider {...stores}>
                    
                    <Tabs
                        ref={ref => {
                            console.log(ref,NavigationStore.getNavigator('MainTabs'))

                            if (ref &&  (!NavigationStore.getNavigator('MainTabs').navigation || this.state.nowMounted)) {
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
                                NavigationStore.handleAction('MainTabs', action)

                            } catch (err) {
                                console.log(err)
                            }
                        }}
                    />
                </Provider>}
                
            </View>
        )
    }
}
export default Root