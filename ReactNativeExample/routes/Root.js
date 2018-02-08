import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation'
import { observer, Provider } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore from 'mobx-react-navigation-store'
import { ScreenOne, ScreenTwo, ScreenThree, SplashScreen } from '../screens'
import NavigatorOne from './NavigatorOne'
const hydrate = create({
    storage: AsyncStorage
})
const stores = { NavigationStore }
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
                NavigationStore.setNavigator('Main', 'MainFirst')
                NavigationStore.setNavigator('NavOne','NavOneFirst','Main')
                NavigationStore.setNavigator('NavTwo','NavTwoFirst','NavOne',false)
                if (!NavigationStore.ActiveNavigator)
                    NavigationStore.setActiveNavigator('Main')
            } catch (err) {
                console.log(err)
            }
            this.setState({hydrated:true})
            setTimeout(()=>NavigationStore.doneHydrating(),1000)
            
        }).catch(error => console.log(error))
    }
    componentDidMount(){
        if(NavigationStore.storeHydrated)
            NavigationStore.setActiveNavigator('Main')

    }
    render() {
        const splashDone = NavigationStore.storeHydrated

        return (
            <View style={{ flex: 1, justifyContent: 'space-around' }}>
                {!splashDone && <SplashScreen />}
                {this.state.hydrated && <Provider {...stores}>
                    <Main
                        ref={ref => {
                            if (ref &&  (!NavigationStore.getNavigator('Main').navigation || this.state.nowMounted)) {
                                this.setState({ nowMounted: false })
                                try {
                                    console.log('set Main Nav')
                                    NavigationStore.setNavigation('Main', ref._navigation)
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        }}
                        onNavigationStateChange={(oldState, newState, action) => {
                            try {
                                NavigationStore.handleAction('Main', action)

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