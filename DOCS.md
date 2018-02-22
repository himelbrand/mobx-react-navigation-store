# Welcome to the Navigation Store Documentation 

## NavigationStore functions

#### setNavigators(navigators,settings)

used to declare and set the navigators in the app and their relation to other navigators and should they persist the navigation state
both navigators and settings are objects as followed:
```javascript
const navigators = {
    navigatorName:{
        type: 'tab', //default value : 'stack'
        initRoute:'Home' //required
        nested: { NestedNavigatorTabs: 'OtherTabs' }, //default value : null , here the key is the name of the route, and the value is the name of the nested navigator
        parent: 'MainNavigator', //default value : null
        shouldPersist: true, //default value : true
        routes:['Home','Screen2','NestedNavigatorTabs'] //default value : null , only required for tab navigators
    }
    /*more navigators*/
}

const settings = {
    order:['MainNavigator','navigatorName','otherTabs'] // the order of nesting depedencies the first is the main and the last is the most nested navigator name
    initNavigatorName:'MainNavigator'//initial navigator on first run or after using the logout function
}

NavigationStore.setNavigators(navigators,settings) //this should happen in the .then of the hydrate function, as seen in the main readme.md
```


### setActiveNavigator(navigatorName:string)

used to set the current active navigator, recommended to use in inside componentDidMount inside the components that renders the navigators
params:
* navigatorName - default: none , description: the name of the navigator to set as active , required: yes

```javascript
componentDidMount(){
    NavigationStore.setActiveNavigator('myNavigator')// if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore
}
```

### goBack(needAction:boolean)

used to go back on screen, even between nested navigators , also helps keep the correctness of the navigation state
params:
* needAction - default: false , description: should the goBack actually go back or just update the state, true is to dispatch the goBack action , required: no

```javascript
//instead of using the this.props.navigation.goBack()
NavigationStore.goBack(true) // if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore
```
### navigate(route:{routeName:string,params:object,action:NavigationAction})

used to navigate between screens
params:
* route - default: none , description: the info of the screen we want to navigate to (based on the navigate of react-navigation) , required: yes
    * routeName - default: none , description: the name of the screen to navigate to , required: yes
    * params - default: none , description: the params for the screen , required: no
    * action - default: none , description: the action to be triggered when getting to the screen , required: no
```javascript
//instead of using the this.props.navigation.navigate(route)
NavigationStore.navigate(route) // if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore
```

### reset(actions:array, index:number)

used to reset navigation stack , index must be inside the bounds of actions array
params:
* actions - default: none , description: array of NavigationActions to reset stack with , required: yes
* index - default: none , description: the index of the wanted screen after the stack reset , required: yes
```javascript
//instead of using the this.props.navigation.reset(actions)
NavigationStore.reset(actions) // if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore
```
### logout()

used to reset all of the navigators in the app to empty stack and initial routes

```javascript
NavigationStore.logout() // if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore
```

### doneHydrating(ready:boolean, delay:number) & StartedStoreHydration()

used to hydrate the store and restore the navigation state
params of doneHydrating:
* ready - default: true , description: if this is false the stacks will not be restored just the current route will be set to initial route , required: no
* delay - default: 1500 , description: the delay wanted after restoring all of the stacks before storeHydrated field is set to true , required: no
note that the ready param is not ready for use and should be implemented correctly so it could differ between navigators, right now should use only if the predicate used regards the resoration of all navigators

StartedStoreHydration is used to change the value of startedStoreHydration in case you want to render the navigator before starting the restoration stage, as seen in the example app

```javascript
componentWillMount() {
    hydrate('navigation', NavigationStore).then(() => {
        NavigationStore.setNavigators({
            MainDrawer: {
                type: 'drawer', //default value : 'stack'
                initRoute:'Home' //required
                nested: { NestedNavigatorTabs: 'MainTabs' }, //default value : null
                parent: null, //default value : null
                shouldPersist: true, //default value : true
                routes:null //default value : null
            },
            /*more navigators*/
            },{
                initialNavigatorName: 'MainDrawer',//the initial navigator name, required
                order:['MainDrawer', 'MainTabs', 'Main', 'NavOne', 'NavTwo']//order of nesting of navigators, required
            })
            !NavigationStore.ActiveNavigator && NavigationStore.setActiveNavigator('MainDrawer')
            setTimeout(() => NavigationStore.doneHydrating(), 1000)
            NavigationStore.StartedStoreHydration()
        }).catch(error => console.log(error))
    }

```

## computed - getters 

All of this functions are getters and are used as fields like so:
for example if the getter is foo()
```javascript
NavigationStore.foo
```

### NavigatorsNames

returns an array of all the navigators names

### AllNavigatorsStacks

returns a map where the keys are navigators names and the values are their stacks

### ActiveNavigator

returns the name of the active navigator

### CurrentRoute

returns the current route name as a string

### canGoBack

returns a boolean value indicating whether or not it's possible to go back in the navigation

## other functions

### getNavigatorStack(navigatorName:string)

used to get the current stack of a navigator by its name
params:
* navigatorName - default: none , description: the name of the navigator that we want to get his current stack , required: yes

### hasNavigator(navigatorName:string)
returns true if there is a set navigator with the given name, other wise returns false

### getNavigator(navigatorName:string)

used to get a navigator by its name, returns an instance of one of the classes StackNavigatorPersist, DrawerNavigatorPersist, TabNavigatorPersist
all of those extends the class NavigatorPersist
here are the fields of each class:
* StackNavigatorPersist
    ```javascript 
    navigation = null
    @persist @observable shouldPersist = true
    @persist @observable initRoute = ''
    @persist @observable parent = ''
    @persist @observable name = ''
    @persist('object', RoutePersist) @observable currentRoute = null
    @persist('object') @observable nested = null 
    @persist('list', RoutePersist) @observable currentStack = []
    ```
* DrawerNavigatorPersist
    ```javascript 
    navigation = null
    @persist @observable shouldPersist = true
    @persist @observable initRoute = ''
    @persist @observable parent = ''
    @persist @observable name = ''
    @persist('object', RoutePersist) @observable currentRoute = null
    @persist('object') @observable nested = null 
    @persist('list', RoutePersist) @observable currentStack = []
    ```
    the DrawerNavigatorPersist also have special functions to control the drawer
    ```javascript 
    open()
    close()
    toggle()
    /*they are used like so*/
    NavigationStore.getNavigator('myDrawerNavigator').open()/*if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore*/
    NavigationStore.getNavigator('myDrawerNavigator').close()/*if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore*/
    NavigationStore.getNavigator('myDrawerNavigator').toggle()/*if you injected NavigationStore use this.props.NavigationStore instead of NavigationStore*/
    ```

* TabNavigatorPersist
    ```javascript 
    navigation = null
    @persist @observable shouldPersist = true
    @persist @observable initRoute = ''
    @persist @observable parent = ''
    @persist @observable name = ''
    @persist('object', RoutePersist) @observable currentRoute = null
    @persist('object') @observable nested = null 
    @persist @observable tabIndex = 0
    @persist @observable initIndex = 0
    @persist('list') @observable stackOfIndexes = []
    @persist('list') @observable routes = []
    jumpIndexFunction = null
    ```

    

## NavigationStore fields - initial
```javascript
    @observable startedStoreHydration = false
    @observable storeHydrated = false
    @persist('map', StackNavigatorPersist) @observable stackNavigators = new Map()
    @persist('map', TabNavigatorPersist) @observable tabNavigators = new Map()
    @persist('map', DrawerNavigatorPersist) @observable drawerNavigators = new Map()
    @persist('list') @observable order = []
    @persist @observable activeNavigator = ''
    @persist @observable initialNavigator = ''
```