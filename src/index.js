const { observable, action, computed } = require('mobx')
const { persist } = require('mobx-persist')
const { NavigationActions } = require('react-navigation')

class RoutePersist {
    @persist @observable routeName = ''
    @persist('object') @observable params = null
    constructor(routeName, params = null) {
        this.routeName = routeName
        this.params = params
    }
}
class NavigatorPersist {
    navigation = null
    @persist @observable shouldPersist = true
    @persist @observable initRoute = ''
    @persist @observable parent = ''
    @persist @observable name = ''
    @persist('object', RoutePersist) @observable currentRoute = null
    @persist('object') @observable nested = null
    constructor(shouldPersist, initRoute, nested, parent, name) {
        this.shouldPersist = shouldPersist
        this.initRoute = initRoute
        this.parent = parent
        this.name = name
        this.nested = nested
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
}
class MyIndex {
    @persist @observable i = 0
    constructor(i) {
        this.i = i
    }
}
class StackNavigatorPersist extends NavigatorPersist {

    @persist('list', RoutePersist) @observable currentStack = []
    constructor(shouldPersist, initRoute, nested, parent, name) {
        super(shouldPersist, initRoute, nested, parent, name)
    }
    @action setRoute(route) {
        if (this.currentRoute && (this.currentRoute.routeName !== route.routeName || (route.params && this.currentRoute.params != route.params))) {
            this.currentStack.push(this.currentRoute)
        }
        this.currentRoute = new RoutePersist(route.routeName, route.params)
    }
}
class TabNavigatorPersist extends NavigatorPersist {
    @persist @observable tabIndex = 0
    @persist @observable initIndex = 0
    @persist('list') @observable stackOfIndexes = []
    @persist('list') @observable routes = []
    jumpIndexFunction = null
    constructor(shouldPersist, initRoute, nested, parent, name, routes) {
        super(shouldPersist, initRoute, nested, parent, name)
        this.routes = routes
        this.initIndex = routes ? routes.indexOf(initRoute) : 0
    }
    @action
    setIndex(index, isNew = true) {
        if (typeof index === 'number' && index !== this.tabIndex) {
            if (isNew)
                this.stackOfIndexes.push(this.tabIndex)
            this.tabIndex = index
            if (this.jumpIndexFunction) {
                console.log('jump to ', index)
                this.jumpIndexFunction(index)
            }
        }
    }
    @action setRoute(route, index,isNew = true) {
        this.setIndex(index, isNew)
        this.currentRoute = new RoutePersist(route.routeName, route.params)
    }
    setJumpIndexFunction(func) {
        this.jumpIndexFunction = func
    }
}

class NavigationStore {
    @observable startedStoreHydration = false
    @observable storeHydrated = false
    @persist('map', StackNavigatorPersist) @observable stackNavigators = new Map()
    @persist('map', TabNavigatorPersist) @observable tabNavigators = new Map()
    @persist @observable activeNavigator = ''
    @persist @observable initialNavigator = ''

    @action setNavigator(name, initRoute, type = 'stack', nested = null, parent = null, shouldPersist = true, routes = null) {
        if (typeof initRoute === 'string' && initRoute.length > 0 && (!this.hasNavigator(name) || this.getNavigator(name).shouldPersist !== shouldPersist || this.getNavigator(name).initRoute !== initRoute || this.getNavigator(name).parent !== parent || JSON.stringify(this.getNavigator(name).nested) !== JSON.stringify(nested) || (type === 'tab' && (!this.getNavigator(name).routes || JSON.stringify(this.getNavigator(name).routes) !== JSON.stringify(routes))))) {
            if (type === 'stack')
                this.stackNavigators.set(name, new StackNavigatorPersist(shouldPersist, initRoute, nested, parent, name))
            else if (type === 'tab')
                this.tabNavigators.set(name, new TabNavigatorPersist(shouldPersist, initRoute, nested, parent, name, routes))
            console.log(`new Navigator set: ${name}, if this is not a new navigator name, all of the stack info is now erased`)
        } else if (this.hasNavigator(name)) {
            console.log(`${name} is already set`)
        } else if (!(typeof initRoute === 'string' && initRoute.length > 0))
            throw new Error('invalid initial route given, must be string with length of at least 1')
    }
    setNavigation(navigatorName, ref) {
        if (this.hasNavigator(navigatorName))
            this.getNavigator(navigatorName).setNavigation(ref)
        else
            throw new Error('no navigator with the given name')

    }
    @action StartedStoreHydration() {
        this.startedStoreHydration = true
    }
    @action setActiveNavigator(navigatorName) {
        console.log('set active:', navigatorName)
        if (this.hasNavigator(navigatorName))
            this.activeNavigator = navigatorName
        else
            throw new Error('no navigator with the given name')
    }
    @action setInitialNavigator(navigatorName) {
        if (this.hasNavigator(navigatorName))
            this.initialNavigator = navigatorName
        else
            throw new Error('no navigator with the given name')
    }
    @action handleAction(navigatorName, action, newState) {
        if (!action || !navigatorName)
            throw new Error('invalid params')
        if (this.hasNavigator(navigatorName)) {
            const navigator = this.getNavigator(navigatorName)
            if (action.type === 'Navigation/BACK') {
                this.goBack(false)
            } else if (action.type === 'Navigation/NAVIGATE') {
                if (action.routeName.includes('NestedNavigator')) {
                    let newNavName = navigator.nested[action.routeName]
                    this.setActiveNavigator(newNavName)
                    let newNav = this.getNavigator(this.activeNavigator)
                    while (newNav.currentRoute.routeName.includes('NestedNavigator')) {
                        newNavName = newNav.nested[newNav.currentRoute.routeName]
                        this.setActiveNavigator(newNavName)
                        newNav = this.getNavigator(this.activeNavigator)
                    }
                }
                navigator instanceof TabNavigatorPersist ?
                    navigator.setRoute({ routeName: action.routeName, params: action.params }, newState.index) :
                    navigator.setRoute({ routeName: action.routeName, params: action.params })
                navigator instanceof TabNavigatorPersist && console.log(navigator.tabIndex)
            } else if (action.type === 'Navigation/RESET') {
                action.actions.forEach(resetAction => {
                    if (resetAction.type === 'Navigation/NAVIGATE') {
                        if (resetAction.routeName.includes('NestedNavigator')) {
                            const newNavName = navigator.nested[resetAction.routeName]
                            this.setActiveNavigator(newNavName)
                        }
                        navigator.setRoute({ routeName: resetAction.routeName, params: resetAction.params })
                    }
                })
            } else {
                console.log(`unhandled navigation action: ${action} ${navigatorName}`)
            }
        } else {
            throw new Error(`no navigator with the given name: ${navigatorName}`)
        }
    }
    @action navigate(route) {
        if (!route)
            throw new Error(`route is required in order to navigate`)
        const navigateAction = NavigationActions.navigate(route)
        const activeNavigator = this.getNavigator(this.activeNavigator)
        const navigation = activeNavigator && activeNavigator.navigation
        const currentRoute = activeNavigator && activeNavigator.currentRoute
        console.log(activeNavigator)
        if ((navigation && (currentRoute && (currentRoute.routeName !== route.routeName || (route.params && currentRoute.params !== route.params)))) || navigation) {
            navigation.dispatch(navigateAction)
        }
        console.log(this.AllNavigatorsStacks)
    }
    @action goBack(needAction = false) {
        const navigator = this.getNavigator(this.activeNavigator)
        if (navigator instanceof StackNavigatorPersist) {
            if (navigator.currentStack.length > 0)
                navigator.currentRoute = navigator.currentStack.pop()
            else if (navigator.parent && navigator.currentStack.length === 0) {
                this.backParent(navigator.parent, needAction)
            }
        } else if (navigator instanceof TabNavigatorPersist) {
            if (navigator.stackOfIndexes.length > 0) {
                navigator.setRoute({ routeName: navigator.routes[navigator.tabIndex] }, navigator.stackOfIndexes.pop(), false)
            } else if (navigator.parent && navigator.stackOfIndexes.length === 0) {
                this.backParent(navigator.parent, needAction)
            }
        }
    }
    @action backParent(parentName, needAction) {
        const parent = this.getNavigator(parentName)
        const parentNav = parent.navigation
        if (needAction) {
            if (parent instanceof StackNavigatorPersist)
                !parentNav.goBack() && parentNav.pop()
            else if (parent instanceof TabNavigatorPersist)
                parentNav.goBack()
            while (parent.currentRoute && parent.currentRoute.routeName.includes('NestedNavigator')) {
                if (parent instanceof StackNavigatorPersist)
                    parent.currentRoute = parent.currentStack.pop()
                else if (parent instanceof TabNavigatorPersist) {
                    parent.setRoute({ routeName: parent.routes[parent.tabIndex] },parent.stackOfIndexes.pop(),false)

                }
            }
        }
        else if (parent instanceof StackNavigatorPersist && parent.currentStack.length > 0) {
            parent.currentRoute = parent.currentStack.pop()
            while (parent.currentRoute.routeName.includes('NestedNavigator'))
                parent.currentRoute = parent.currentStack.pop()
        }
        else if (parent instanceof TabNavigatorPersist && parent.stackOfIndexes.length > 0) {
            parent.setRoute({ routeName: parent.routes[parent.tabIndex] },parent.stackOfIndexes.pop(),false)
            while (parent.currentRoute.includes('NestedNavigator') && parent.stackOfIndexes.length > 0) {
                parent.setRoute({ routeName: parent.routes[parent.tabIndex] },parent.stackOfIndexes.pop(),false)
            }
        }
        this.setActiveNavigator(parentName)
    }
    @action reset(actions, index) {
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
        const names = this.NavigatorsNames
        const navigators = names.map(name => this.getNavigator(name))
        navigators.forEach(navigator => {
            const resetAction = navigator instanceof StackNavigatorPersist ?
                NavigationActions.reset({
                    index: 0,
                    actions: [
                        NavigationActions.navigate({ routeName: navigator.initRoute })
                    ]
                }) :
                NavigationActions.navigate({ routeName: navigator.initRoute })
            if (navigator instanceof TabNavigatorPersist)
                navigator.tabIndex = navigator.initIndex
            navigator instanceof StackNavigatorPersist ? navigator.currentStack.clear() : navigator.stackOfIndexes.clear()
            navigator.currentRoute = navigator instanceof StackNavigatorPersist ? null : new RoutePersist(navigator.initRoute)


            navigator.navigation && navigator.navigation.dispatch(resetAction)
            setTimeout(() => {
                if (!navigator.nested)
                    navigator.navigation = null
            }, 1000)
        })
        this.setActiveNavigator(this.initialNavigator)

    }
    @action doneHydrating(ready = true, delay = 1500) {
        const stackNavigatorsNames = this.NavigatorsNames
        stackNavigatorsNames.forEach((name, index) => {
            const navigator = this.getNavigator(name)
            let actions = []

            if (navigator.shouldPersist && navigator instanceof StackNavigatorPersist) {
                actions = navigator.currentStack.map((route) => NavigationActions.navigate(route))
                navigator.currentStack.clear()
                if (navigator.currentRoute)
                    actions.push(NavigationActions.navigate(navigator.currentRoute))
            } else if (navigator instanceof StackNavigatorPersist) {
                navigator.currentStack.clear()
                actions.push(NavigationActions.navigate({ routeName: navigator.initRoute }))
            } else if (navigator.shouldPersist && navigator instanceof TabNavigatorPersist) {
                let action = null
                navigator.stackOfIndexes.clear()
                if (navigator.currentRoute)
                    action = NavigationActions.navigate(navigator.currentRoute)
                else
                    action = NavigationActions.navigate({ routeName: navigator.routes[navigator.tabIndex] })

                if (ready && navigator.navigation) {
                    navigator.currentRoute = null
                    navigator.navigation.dispatch(action)
                } else {
                    navigator.currentRoute = new RoutePersist(navigator.initRoute)
                }
            } else if (navigator instanceof TabNavigatorPersist) {
                navigator.stackOfIndexes.clear()
                if (ready && navigator.navigation) {
                    navigator.currentRoute = new RoutePersist(navigator.initRoute)
                } else {

                    navigator.currentRoute = new RoutePersist(navigator.initRoute)
                }
            }
            if (ready && navigator.navigation && actions.length >= 1 && navigator instanceof StackNavigatorPersist) {
                let resetAction = NavigationActions.reset({
                    index: actions.length - 1,
                    actions: actions
                })
                navigator.currentRoute = null
                navigator.navigation.dispatch(resetAction)
            } else if (navigator instanceof StackNavigatorPersist && (!navigator.currentRoute || !ready)) {
                navigator.currentRoute = new RoutePersist(navigator.initRoute)
            }
        })
        setTimeout(() => this.storeHydrated = true, delay)
    }
    @computed get NavigatorsNames() {
        return Array.from(this.stackNavigators.keys()).concat(Array.from(this.tabNavigators.keys()))
    }
    getNavigatorStack(navigatorName) {
        const navigator = this.getNavigator(navigatorName)
        return navigator instanceof StackNavigatorPersist ? navigator.currentStack.peek() : []
    }
    @computed get AllNavigatorsStacks() {
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
    @computed get CurrentRoute() {
        return this.getNavigator(this.activeNavigator) && this.getNavigator(this.activeNavigator).currentRoute ?
            this.getNavigator(this.activeNavigator).currentRoute.routeName :
            'not found'

    }
    @computed get canGoBack() {
        const names = this.NavigatorsNames
        const stacks = names.map(name => this.getNavigatorStack(name))
        const ans = stacks.reduce((acc, curr) => acc || curr.length > 0, false)
        return ans
    }
    getNavigator(navigatorName) {
        let ans = this.stackNavigators.get(navigatorName)
        if (!ans)
            ans = this.tabNavigators.get(navigatorName)
        return ans
    }
    hasNavigator(navigatorName) {
        return this.stackNavigators.has(navigatorName) || this.tabNavigators.has(navigatorName)
    }
}

const singelton = new NavigationStore()

module.exports = singelton