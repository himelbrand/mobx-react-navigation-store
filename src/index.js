import { observable, action, computed } from 'mobx'
import { persist } from 'mobx-persist'
import { NavigationActions } from 'react-navigation'
import { StackNavigator, TabNavigator, DrawerNavigator } from './navigators'


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

class DrawerNavigatorPersist extends NavigatorPersist {
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
    open() {
        if (this.navigation) {
            this.navigation.navigate('DrawerOpen')
        }
    }
    close() {
        if (this.navigation) {
            this.navigation.navigate('DrawerClose')
        }
    }
    toggle() {
        if (this.navigation) {
            this.navigation.navigate('DrawerToggle')
        }
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
                this.jumpIndexFunction(index)
            }
        }
    }
    @action setRoute(route, index, isNew = true) {
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
    @persist('map', DrawerNavigatorPersist) @observable drawerNavigators = new Map()
    @persist('list') @observable order = []
    @persist @observable activeNavigator = ''
    @persist @observable initialNavigator = ''

    @action setNavigators(navigators, settings) {
        const navigatorsEntries = Object.entries(navigators)
        navigatorsEntries.forEach((entry) => {
            this.setNavigator(entry[0], entry[1])
        })
        if (!settings || !settings.order || !settings.initialNavigatorName)
            throw new Error('order and initialNavigatorName are required')
        this.setOrder(settings.order)
        this.setInitialNavigator(settings.initialNavigatorName)
    }
    @action setNavigator(name, settings) {
        let { initRoute, type, nested, parent, shouldPersist, routes } = settings
        if (shouldPersist !== false)
            shouldPersist = true
        if (!type)
            type = 'stack'
        if (!nested)
            nested = null
        if (!parent)
            parent = null
        if (shouldPersist === undefined || shouldPersist === null)
            shouldPersist = true
        if (!routes)
            routes = null
        if (typeof initRoute === 'string' && initRoute.length > 0 && (!this.hasNavigator(name) || this.getNavigator(name).shouldPersist !== shouldPersist || this.getNavigator(name).initRoute !== initRoute || this.getNavigator(name).parent !== parent || JSON.stringify(this.getNavigator(name).nested) !== JSON.stringify(nested) || (type === 'tab' && (!this.getNavigator(name).routes || JSON.stringify(this.getNavigator(name).routes) !== JSON.stringify(routes))))) {
            if (type === 'stack')
                this.stackNavigators.set(name, new StackNavigatorPersist(shouldPersist, initRoute, nested, parent, name))
            else if (type === 'tab')
                this.tabNavigators.set(name, new TabNavigatorPersist(shouldPersist, initRoute, nested, parent, name, routes))
            else if (type === 'drawer')
                this.drawerNavigators.set(name, new DrawerNavigatorPersist(shouldPersist, initRoute, nested, parent, name, false))

            console.log(`new Navigator set: ${name}, if this is not a new navigator name, all of the stack info is now erased`)
        }
        else if (!(typeof initRoute === 'string' && initRoute.length > 0))
            throw new Error('invalid initial route given, must be string with length of at least 1')
        else if (this.hasNavigator(name))
            console.log(`${name} is already set`)
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
    @action setOrder(order) {
        if (JSON.stringify(this.order) !== JSON.stringify(order))
            this.order = order
    }
    @action setActiveNavigator(navigatorName) {
        if (this.hasNavigator(navigatorName)) {
            this.activeNavigator = navigatorName
        } else
            throw new Error('no navigator with the given name')
    }
    @action setInitialNavigator(navigatorName) {
        if (this.hasNavigator(navigatorName))
            this.initialNavigator = navigatorName
        else
            throw new Error('no navigator with the given name')
    }
    @action handleAction(navigatorName, oldState, newState, action) {
        if (!action || !navigatorName)
            throw new Error('invalid params')
        if (this.hasNavigator(navigatorName)) {
            const navigator = this.getNavigator(navigatorName)
            if (action.type === 'Navigation/BACK') {
                this.backParent(navigatorName, false)
            } else if (action.type === 'Navigation/NAVIGATE') {
                if (action.routeName.includes('NestedNavigator')) {
                    let newNavName = navigator.nested[action.routeName]
                    this.setActiveNavigator(newNavName)
                    let newNav = this.getNavigator(this.activeNavigator)
                    if (!newNav.currentRoute)
                        newNav.currentRoute = new RoutePersist(newNav.initRoute)
                    while (newNav.currentRoute.routeName.includes('NestedNavigator')) {
                        newNavName = newNav.nested[newNav.currentRoute.routeName]
                        this.setActiveNavigator(newNavName)
                        newNav = this.getNavigator(this.activeNavigator)
                    }
                }
                if (action.routeName !== 'DrawerOpen' && action.routeName !== 'DrawerClose' && action.routeName !== 'DrawerToggle')
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
                        if (resetAction.routeName !== 'DrawerOpen' && resetAction.routeName !== 'DrawerClose' && resetAction.routeName !== 'DrawerToggle')
                            navigator.setRoute({ routeName: resetAction.routeName, params: resetAction.params })
                    }
                })
            } else if (action.type === 'Navigation/POP') {
                //this.goBack(false)
            } else if (action.type === 'Navigation/COMPLETE_TRANSITION') {

            } else {
                console.log(`unhandled navigation action: ${navigatorName}`, action)
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
        if ((navigation && (currentRoute && (currentRoute.routeName !== route.routeName || (route.params && currentRoute.params !== route.params)))) || navigation) {
            navigation.dispatch(navigateAction)
        }

    }
    @action goBack(needAction = false) {
        if (this.activeNavigator === 'Main')
            console.log(this.activeNavigator, this.getNavigatorStack('Main'))
        const navigator = this.getNavigator(this.activeNavigator)

        if (navigator instanceof StackNavigatorPersist || navigator instanceof DrawerNavigatorPersist) {
            if (navigator.currentStack.length > 0) {
                this.backParent(this.activeNavigator, needAction)
                navigator.currentRoute = navigator.currentStack.pop()
            } else if (navigator.parent && navigator.currentStack.length === 0) {
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
            if (parent instanceof StackNavigatorPersist || parent instanceof DrawerNavigatorPersist)
                !parentNav.goBack() && parentNav.pop()
            else if (parent instanceof TabNavigatorPersist) {
                parent.setRoute({ routeName: parent.routes[parent.tabIndex] }, parent.stackOfIndexes.pop(), false)

            }
            while (parent.currentRoute && parent.currentRoute.routeName.includes('NestedNavigator')) {
                if (parent instanceof StackNavigatorPersist || parent instanceof DrawerNavigatorPersist)
                    parent.currentRoute = parent.currentStack.pop()
                else if (parent instanceof TabNavigatorPersist) {
                    parent.setRoute({ routeName: parent.routes[parent.tabIndex] }, parent.stackOfIndexes.pop(), false)

                }
            }
        }
        else if ((parent instanceof StackNavigatorPersist || parent instanceof DrawerNavigatorPersist) && parent.currentStack.length > 0) {
            parent.currentRoute = parent.currentStack.pop()
            while (parent.currentRoute.routeName.includes('NestedNavigator'))
                parent.currentRoute = parent.currentStack.pop()
        }
        else if (parent instanceof TabNavigatorPersist && parent.stackOfIndexes.length > 0) {
            console.log('doing back')
            parent.setRoute({ routeName: parent.routes[parent.tabIndex] }, parent.stackOfIndexes.pop(), false)

            while (parent.currentRoute.includes('NestedNavigator') && parent.stackOfIndexes.length > 0) {
                parent.setRoute({ routeName: parent.routes[parent.tabIndex] }, parent.stackOfIndexes.pop(), false)

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
        const activeNavigator = this.getNavigator(this.activeNavigator)
        const navigation = activeNavigator.navigation
        if (navigation){
            activeNavigator instanceof StackNavigatorPersist || activeNavigator instanceof DrawerNavigatorPersist ? activeNavigator.currentStack.clear() : activeNavigator.stackOfIndexes.clear()
            navigation.dispatch(resetAction)
        }
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
            navigator instanceof StackNavigatorPersist || navigator instanceof DrawerNavigatorPersist ? navigator.currentStack.clear() : navigator.stackOfIndexes.clear()
            navigator.currentRoute = navigator instanceof StackNavigatorPersist || navigator instanceof DrawerNavigatorPersist ? null : new RoutePersist(navigator.initRoute)


            navigator.navigation && navigator.navigation.dispatch(resetAction)
            setTimeout(() => {
                if (!navigator.nested)
                    navigator.navigation = null
            }, 1000)
        })
        this.setActiveNavigator(this.initialNavigator)

    }
    @action doneHydrating(ready = true, delay = 1500) {
        const stackNavigatorsNames = this.order
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
            } else if (navigator.shouldPersist && navigator instanceof DrawerNavigatorPersist) {
                actions = navigator.currentStack.map((route) => ({ routeName: route.routeName, params: route.params }))
                if (navigator.currentRoute)
                    actions.push({ routeName: navigator.currentRoute.routeName, params: navigator.currentRoute.params })
            } else if (navigator instanceof DrawerNavigatorPersist) {
                navigator.currentStack.clear()
                actions.push({ routeName: navigator.initRoute })
            }
            if (ready && navigator.navigation && actions.length >= 1 && navigator instanceof StackNavigatorPersist) {
                let resetAction = NavigationActions.reset({
                    index: actions.length - 1,
                    actions: actions
                })
                navigator.currentRoute = null
                navigator.navigation.dispatch(resetAction)
            } else if (ready && navigator.navigation && actions.length >= 1 && navigator instanceof DrawerNavigatorPersist) {
                navigator.currentRoute = null
                actions.forEach((route) => navigator.navigation.navigate(route))
            } else if ((navigator instanceof StackNavigatorPersist || navigator instanceof DrawerNavigatorPersist) && (!navigator.currentRoute || !ready)) {
                navigator.currentRoute = new RoutePersist(navigator.initRoute)
            }
        })
        setTimeout(() => this.storeHydrated = true, delay)
    }
    @computed get NavigatorsNames() {
        return Array.from(this.stackNavigators.keys()).concat(Array.from(this.tabNavigators.keys())).concat(Array.from(this.drawerNavigators.keys()))
    }
    getNavigatorStack(navigatorName) {
        const navigator = this.getNavigator(navigatorName)
        return navigator instanceof StackNavigatorPersist || navigator instanceof DrawerNavigatorPersist ? navigator.currentStack.peek() : []
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
        let ans = this.stackNavigators.has(navigatorName) && this.stackNavigators.get(navigatorName)
        if (!ans)
            ans = this.tabNavigators.has(navigatorName) && this.tabNavigators.get(navigatorName)
        if (!ans)
            ans = this.drawerNavigators.has(navigatorName) && this.drawerNavigators.get(navigatorName)
        return ans
    }
    hasNavigator(navigatorName) {
        return this.stackNavigators.has(navigatorName) || this.tabNavigators.has(navigatorName) || this.drawerNavigators.has(navigatorName)
    }
}

const singelton = new NavigationStore()

export default singelton

export {
    StackNavigator,
    TabNavigator,
    DrawerNavigator
}