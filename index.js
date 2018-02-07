const { observable, action, computed } = require('mobx')
const { persist } = require('mobx-persist')
const { NavigationActions } = require('react-navigation')

class RoutePersist {
    @persist @observable routeName = ''
    @persist('object') @observable params = null
    constructor(routeName, params) {
        this.routeName = routeName
        this.params = params
    }
}
class NavigatorPersist {
    navigation = null
    @persist @observable shouldPersist = true
    @persist @observable initRoute = null
    @persist('list', RoutePersist) @observable currentStack = []
    @persist('object', RoutePersist) @observable currentRoute = null
    constructor(shouldPersist, initRoute) {
        this.shouldPersist = shouldPersist
        this.initRoute = initRoute
    }
    @computed get CurrentRoute() {
        return this.currentRoute.routeName
    }
    setNavigation(ref) {
        this.navigation = ref
    }
    @action setInitRoute(routeName) {
        this.initRoute = routeName
    }
    @action setShouldPersist(flag) {
        this.shouldPersist = flag
    }
    @action setRoute(route) {
        if (this.currentRoute && (this.currentRoute.routeName !== route.routeName || (route.params && this.currentRoute.params != route.params)))
            this.currentStack.push(this.currentRoute)
        this.currentRoute = new Route(route.routeName, route.params)
    }
    @action goBack(needAction) {
        if (needAction)
            this.navigation.goBack()
        else if (this.currentStack.length > 0)
            this.currentRoute = this.currentRoute.pop()
    }
}

class NavigationStore {
    @observable storeHydrated = false
    @observable navigators = new Map()
    @persist('map', NavigatorPersist) navigators = new Map()
    @persist @observable activeNavigator = null

    @action setNavigator(name, initRoute, shouldPersist = true) {
        if (typeof initRoute === 'string' && initRoute.length > 0) {
            this.navigators.set(name, new NavigatorPersist(shouldPersist, initRoute))
            console.log(`new Navigator set: ${name}, if this is not a new navigator name, all of the stack info is now erased`)
        } else
            throw new Error('invalid initial route given, must be string with length of at least 1')
    }
    @action setNavigation(navigatorName, ref) {
        if (this.navigators.has(navigatorName))
            this.navigators.get(navigatorName).setNavigation(ref)
        else
            throw new Error('no navigator with the given name')

    }
    @action setActiveNavigator(navigatorName) {
        if (this.navigators.has(navigatorName))
            this.activeNavigator = navigatorName
        else
            throw new Error('no navigator with the given name')
    }
    @action handleAction(navigatorName, action) {
        if (!action || !navigatorName)
            throw new Error('invalid params')
        if (this.navigators.has(navigatorName)) {
            const navigator = this.navigators.get(navigatorName)
            if (action.type === 'Navigation/BACK') {
                navigator.goBack(false)
            } else if (action.type === 'Navigation/NAVIGATE') {
                navigator.setRoute({ routeName: action.routeName, params: action.params })
            } else if (action.type === 'Navigation/RESET') {
                action.actions.forEach(resetAction => {
                    if (resetAction.type === 'Navigation/NAVIGATE')
                        navigator.setRoute({ routeName: resetAction.routeName, params: resetAction.params })
                })
            } else {
                throw new Error('not a valid navigation action')
            }
        } else {
            throw new Error('no navigator with the given name')
        }
    }
    @action navigate(route) {//{routeName,params?,action?}
        const navigateAction = NavigationActions.navigate(route)
        const activeNavigator = this.navigators.get(this.activeNavigator)
        const navigation = activeNavigator.navigation
        const currentRoute = activeNavigator.currentRoute
        if (navigation && (currentRoute && (currentRoute.routeName !== route.routeName || (route.params && currentRoute.params !== route.params))))
            navigation.dispatch(navigateAction)
    }
    @action goBack(needAction) {
        navigators.get(this.activeNavigator).goBack(needAction)
    }
    @action reset(actions, index) {//{routeName,params?,action?}
        if (actions.length < index - 1)
            throw new Error('invalid index - out of bounds')
        const resetAction = NavigationActions.reset({
            index: index,
            actions: actions
        })
        const activeNavigator = this.navigators.get(this.activeNavigator)
        const navigation = activeNavigator.navigation
        if (navigation)
            navigation.dispatch(resetAction)
    }
    @action logout() {
        const navigators = this.navigators.values()
        navigators.forEach(navigator => {
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: navigator.initRoute })
                ]
            })
            navigator.currentStack.clear()
            navigator.currentRoute = null
            navigator.navigation.dispatch(resetAction)
            setTimeout(() => navigator.navigation = null, 1000)
        })
    }
    @action doneHydrating(ready = true, delay = 1500) {
        const navigators = this.navigators.values()
        const navigatorsNames = this.navigators.keys()
        let actions = {}
        navigators.forEach((navigator, index) => {
            let actions = []
            if (navigator.shouldPersist) {
                actions = navigator.currentStack.map((route) => NavigationActions.navigate(route))
                navigator.currentStack.clear()
                if (navigator.currentRoute)
                    actions.push(NavigationActions.navigate(navigator.currentRoute))
            } else {
                actions.push(NavigationActions.navigate({ routeName: navigator.initRoute }))
            }
            if (ready && navigator.navigation && actions.length > 1) {
                let resetAction = NavigationActions.reset({
                    index: actions.length - 1,
                    actions: actions
                })
                navigator.currentRoute = null
                navigator.navigation.dispatch(resetAction)
            } else if (!navigator.currentRoute || !ready) {
                navigator.currentRoute = new RoutePersist(navigator.initRoute)
            }
        })
        setTimeout(() => this.storeHydrated = true, delay)
    }
    @computed get NavigatorsNames() {
        return this.navigators.keys()
    }
    @computed getNavigatorStack(navigatorName) {
        return this.navigators.get(navigatorName).currentStack.peek()
    }
    @computed get allNavigatorsStacks() {
        const names = this.NavigatorsNames
        const stacks = names.map(name => this.getNavigatorStack(name))
        let ans = {}
        for (let i = 0; i < names.length; i++) {
            ans[names[i]] = stacks[i]
        }
        return ans
    }
    @computed get ActiveNavigator() {
        return this.activeNavigator
    }
    @computed get currentRoute() {
        return `${this.navigators.get(this.activeNavigator).currentRoute}@${this.activeNavigator}`
    }
    @computed getNavigator(navigatorName) {
        return this.navigators.get(navigatorName)
    }
}

const singelton = new NavigationStore()

module.exports = singelton