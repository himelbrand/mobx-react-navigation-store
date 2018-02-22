
import React, { Component } from 'react'
import { TabNavigator, NavigationActions } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import NavigationStore from '..'


const create = (name, routeConfigs, tabNavigatorConfig) => {
    const realNavigatorConfig = tabNavigatorConfig
    if (!realNavigatorConfig.backBehavior)
        realNavigatorConfig.backBehavior = 'none'
    if (realNavigatorConfig.navigationOptions && realNavigatorConfig.navigationOptions.tabBarOnPress)
        realNavigatorConfig.navigationOptions.tabBarOnPress = (nav) => {
            const navigator = NavigationStore.getNavigator(name)
            NavigationStore.setActiveNavigator(name)
            navigator.setJumpIndexFunction(nav.jumpToIndex)
            NavigationStore.navigate(nav.scene.route)
            tabNavigatorConfig.navigationOptions.tabBarOnPress(nav)
        }
    else if (realNavigatorConfig.navigationOptions && !realNavigatorConfig.navigationOptions.tabBarOnPress)
        realNavigatorConfig.navigationOptions.tabBarOnPress = (nav) => {
            const navigator = NavigationStore.getNavigator(name)
            NavigationStore.setActiveNavigator(name)
            navigator.setJumpIndexFunction(nav.jumpToIndex)
            NavigationStore.navigate(nav.scene.route)
        }
    else if (!realNavigatorConfig.navigationOptions) {
        realNavigatorConfig.navigationOptions = {
            tabBarOnPress: (nav) => {
                const navigator = NavigationStore.getNavigator(name)
                NavigationStore.setActiveNavigator(name)
                navigator.setJumpIndexFunction(nav.jumpToIndex)
                NavigationStore.navigate(nav.scene.route)
            }
        }
    }
    const navigator = TabNavigator(
        routeConfigs,
        realNavigatorConfig
    )
    return props => <TabNav name={name} nav={navigator} {...props} />
}

@observer
class TabNav extends Component {
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
        NavigationStore.setActiveNavigator(this.props.name)
    }
    render() {
        const Navigator = this.props.nav
        const name = this.props.name
        return (
            <Navigator
                ref={ref => {
                    if (ref && (!NavigationStore.getNavigator(name).navigation || this.state.nowMounted)) {
                        this.setState({ nowMounted: false })
                        try {
                            NavigationStore.setNavigation(name, ref._navigation)
                            this.props.ref && this.props.ref(ref)
                        } catch (err) {
                            console.log(err)
                        }
                    }
                }}
                onNavigationStateChange={(oldState, newState, action) => {
                    NavigationStore.handleAction(name, oldState, newState, action)
                    this.props.onNavigationStateChange && this.props.onNavigationStateChange(oldState, newState, action)
                }}
                screenProps={this.props.screenProps}
            />

        )
    }
}
export default create