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
    @persist @observable parent = null
    @persist @observable name = ''

    @persist('object', RoutePersist) @observable currentRoute = null
    constructor(shouldPersist, initRoute, parent, name) {
        this.shouldPersist = shouldPersist
        this.initRoute = initRoute
        this.parent = parent
        this.name = name
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
    constructor(shouldPersist, initRoute, parent, name) {
        super(shouldPersist, initRoute, parent, name)
    }
    @action setRoute(route) {
        if (this.currentRoute && (this.currentRoute.routeName !== route.routeName || (route.params && this.currentRoute.params != route.params))){
            this.currentStack.push(this.currentRoute)
        }
        this.currentRoute = new RoutePersist(route.routeName, route.params)
    }
}
class TabNavigatorPersist extends NavigatorPersist {
    @persist @observable tabIndex = 0
    @persist('list') @observable stackOfIndexes = []
    @persist('list') @observable routes = []
    jumpIndexFunction = null
    constructor(shouldPersist, initRoute, parent, name, routes) {
        super(shouldPersist, initRoute, parent, name)
        this.routes = routes
    }
    @action
    async setIndex(index) {
        console.log('setIndex Called!')
        console.log('index:', index)
        console.log('tabIndex:', this.tabIndex)
        if (index !== this.tabIndex) {
            this.tabIndex = index
            if (this.jumpIndexFunction)
                this.jumpIndexFunction(index)
        }
    }
    @action setRoute(route) {
        if (this.currentRoute && (this.currentRoute.routeName !== route.routeName || (route.params && this.currentRoute.params != route.params)))
            this.stackOfIndexes.push(this.tabIndex)
        this.currentRoute = route.routeName
    }
    setJumpIndexFunction(func) {
        this.jumpIndexFunction = func
    }
}

class NavigationStore {
    @observable storeHydrated = false
    @persist('map', StackNavigatorPersist) @observable stackNavigators = new Map()
    @persist('map', TabNavigatorPersist) @observable tabNavigators = new Map()
    @persist @observable activeNavigator = ''
    @persist @observable initialNavigator = ''

    @action setNavigator(name, initRoute, type = 'stack', parent = null, shouldPersist = true, routes = null) {
        if (typeof initRoute === 'string' && initRoute.length > 0 && (!this.hasNavigator(name) || this.getNavigator(name).shouldPersist !== shouldPersist || this.getNavigator(name).initRoute !== initRoute || this.getNavigator(name).parent !== parent)) {
            if (type === 'stack')
                this.stackNavigators.set(name, new StackNavigatorPersist(shouldPersist, initRoute, parent, name))
            console.log(`new Navigator set: ${name}, if this is not a new navigator name, all of the stack info is now erased`)
        } else if (this.stackNavigators.has(name))
            console.log(`${name} is already set`)
        else
            throw new Error('invalid initial route given, must be string with length of at least 1')
    }
    setNavigation(navigatorName, ref) {
        if (this.stackNavigators.has(navigatorName))
            this.stackNavigators.get(navigatorName).setNavigation(ref)
        else if (this.tabNavigators.has(navigatorName))
            this.tabNavigators.get(navigatorName).setNavigation(ref)
        else
            throw new Error('no navigator with the given name')

    }
    @action setActiveNavigator(navigatorName) {
        if (this.stackNavigators.has(navigatorName) || this.tabNavigators.has(navigatorName) )
            this.activeNavigator = navigatorName
        else
            throw new Error('no navigator with the given name')
    }
    @action setInitialNavigator(navigatorName) {
        if (this.stackNavigators.has(navigatorName) || this.tabNavigators.has(navigatorName))
            this.initialNavigator = navigatorName
        else
            throw new Error('no navigator with the given name')
    }
    @action handleAction(navigatorName, action) {
        if (!action || !navigatorName)
            throw new Error('invalid params')
        if (this.hasNavigator(navigatorName)) {
            const navigator = this.getNavigator(navigatorName)
            if (action.type === 'Navigation/BACK') {
                this.goBack(false)
            } else if (action.type === 'Navigation/NAVIGATE') {
                navigator.setRoute({ routeName: action.routeName, params: action.params })
            } else if (action.type === 'Navigation/RESET') {
                action.actions.forEach(resetAction => {
                    if (resetAction.type === 'Navigation/NAVIGATE')
                        navigator.setRoute({ routeName: resetAction.routeName, params: resetAction.params })
                })
            } else {
                console.log(`unhandled navigation action: ${action.type}`)
            }
        } else {
            throw new Error(`no navigator with the given name: ${navigatorName}`)
        }
    }
    @action navigate(route) {//{routeName,params?,action?}
        if (!route)
            throw new Error(`route is required in order to navigate`)
        const navigateAction = NavigationActions.navigate(route)
        const activeNavigator = this.getNavigator(this.activeNavigator)
        const navigation = activeNavigator && activeNavigator.navigation
        const currentRoute = activeNavigator && activeNavigator.currentRoute
        if ((navigation && (currentRoute && (currentRoute.routeName !== route.routeName || (route.params && currentRoute.params !== route.params)))) || navigation){
            navigation.dispatch(navigateAction)
        }
    }
    @action goBack(needAction = false) {
        const navigator = this.getNavigator(this.activeNavigator)
        if (navigator instanceof StackNavigatorPersist) {
            if (navigator.currentStack.length > 0)
                navigator.currentRoute = navigator.currentStack.pop()
            else if (navigator.parent && navigator.currentStack.length === 0) {
                this.backParent(navigator.parent,needAction)
            }
        } else if (navigator instanceof TabNavigatorPersist) {
            if (navigator.stackOfIndexes.length > 0) {
                navigator.tabIndex = navigator.stackOfIndexes.pop()
                navigator.currentRoute = navigator.routes[navigator.tabIndex]
            } else if (navigator.parent && navigator.stackOfIndexes.length === 0) {
                this.backParent(navigator.parent,needAction)
            }
        }
    }
    @action backParent(parentName,needAction) {
        const parent = this.getNavigator(parentName)
        const parentNav = parent.navigation
        if (needAction) {
            if (parent instanceof StackNavigatorPersist)
                !parentNav.goBack() && parentNav.pop()
            else if (parent instanceof TabNavigatorPersist)
                parentNav.goBack()
            while (
                (typeof parent.currentRoute === 'string' && parent.currentRoute.includes('NestedNavigator')) || 
                (typeof parent.currentRoute !== 'string' && parent.currentRoute.routeName.includes('NestedNavigator'))
            ) {
                if (parent instanceof StackNavigatorPersist)
                    parent.currentRoute = parent.currentStack.pop()
                else if (parent instanceof TabNavigatorPersist) {
                    parent.tabIndex = parent.stackOfIndexes.pop()
                    parent.currentRoute = parent.routes[parent.tabIndex]
                }
            }
        }
        else if (parent instanceof StackNavigatorPersist && parent.currentStack.length > 0) {
            parent.currentRoute = parent.currentStack.pop()
            while (parent.currentRoute.routeName.includes('NestedNavigator'))
                parent.currentRoute = parent.currentStack.pop()
        }
        else if (parent instanceof TabNavigatorPersist && parent.stackOfIndexes.length > 0) {
            parent.tabIndex = parent.stackOfIndexes.pop()
            parent.currentRoute = parent.routes[parent.tabIndex]
            while (parent.currentRoute.includes('NestedNavigator')){
                parent.tabIndex = parent.stackOfIndexes.pop()
                parent.currentRoute = parent.routes[parent.tabIndex]
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
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: navigator.initRoute })
                ]
            })
            navigator.currentStack.clear()
            navigator.currentRoute = null
            navigator.navigation && navigator.navigation.dispatch(resetAction)
            setTimeout(() => {
                if (navigator.name !== this.initialNavigator)
                    navigator.navigation = null
            }, 1000)
        })
        this.setActiveNavigator(this.initialNavigator)

    }
    @action doneHydrating(ready = true, delay = 1500) {
        const stackNavigatorsNames = Array.from(this.stackNavigators.keys())
        let actions = {}
        stackNavigatorsNames.forEach((name, index) => {
            const navigator = this.getNavigator(name)
            console.log('done hydrating - navigator:', navigator)
            let actions = []
            if (navigator.shouldPersist) {
                actions = navigator.currentStack.map((route) => NavigationActions.navigate(route))
                navigator.currentStack.clear()
                if (navigator.currentRoute)
                    actions.push(NavigationActions.navigate(navigator.currentRoute))
            } else {
                navigator.currentStack.clear()
                actions.push(NavigationActions.navigate({ routeName: navigator.initRoute }))
            }
            if (ready && navigator.navigation && actions.length >= 1) {
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
        return Array.from(this.stackNavigators.keys()).concat(Array.from(this.tabNavigators.keys()))
    }
    getNavigatorStack(navigatorName) {
        const navigator = this.getNavigator(navigatorName)
        console.log()
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
        return this.getNavigator(this.activeNavigator) && typeof this.getNavigator(this.activeNavigator).currentRoute === 'string' ?
            this.getNavigator(this.activeNavigator).currentRoute + '@' + this.activeNavigator :
            this.getNavigator(this.activeNavigator).currentRoute.routeName + '@' + this.activeNavigator

    }
    @computed get canGoBack() {
        const names = this.NavigatorsNames
        console.log(names)
        const stacks = names.map(name => this.getNavigatorStack(name))
        console.log(stacks)
        const ans = stacks.reduce((acc, curr) => acc || curr.length > 0, false)
        return ans
    }
    getNavigator(navigatorName) {
         let ans = this.stackNavigators.get(navigatorName)
         console.log(this.stackNavigators,ans)
         if(!ans)
            ans = this.tabNavigators.get(navigatorName)
        return ans
    }
    hasNavigator(navigatorName) {
       return this.stackNavigators.has(navigatorName) || this.tabNavigators.has(navigatorName)
   }
}

const singelton = new NavigationStore()

module.exports = singelton