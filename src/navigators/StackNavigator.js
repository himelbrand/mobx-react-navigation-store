
import React, { Component }from 'react'
import { StackNavigator, NavigationActions } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'


const create = (name, routeConfigs, stackNavigatorConfig,refFunc, stateChangeFunc) => {
    const navigator = StackNavigator(
        routeConfigs,
        stackNavigatorConfig
    )
    return props => <StackNav name={name} refFunc={refFunc} stateChangeFunc={stateChangeFunc} nav={navigator} {...props} />
}

@inject('NavigationStore')
@observer
class StackNav extends Component {
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
        this.props.NavigationStore.setActiveNavigator(this.props.name)
    }
    render() {
        const Navigator = this.props.nav
        const name = this.props.name
        return (
            <Navigator
                ref={ref => {
                    if (ref && (!this.props.NavigationStore.getNavigator(name).navigation || this.state.nowMounted)) {
                        this.setState({ nowMounted: false })
                        try {
                            this.props.NavigationStore.setNavigation(name, ref._navigation)
                            this.props.refFunc && this.props.refFunc(ref)
                        } catch (err) {
                            console.log(err)
                        }
                    }
                }}
                onNavigationStateChange={(oldState, newState, action) => {
                    this.props.NavigationStore.handleAction(name, oldState, newState, action)
                    this.props.stateChangeFunc && this.props.stateChangeFunc(oldState, newState, action)
                }}
                screenProps={this.props.screenProps}
            />

        )
    }
}
export default create