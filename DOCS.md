# Welcome to the Navigation Store DOCS

## NavigationStore functions

### actions

#### setNavigator(name:string, initRoute:string, parent:string, shouldPersist:boolean)

used to declare and set the navigators in the app and their relation to other navigators and should they persist the navigation state
params:
* name - default: none , description: navigator's name , required: yes
* initRoute - default: none , description: navigator's initial route name , required: yes
* parent - default: null , description: navigator's parent navigator's name , required: no
* initRoute - default: true , description: should navigator persist state , required: no

### setActiveNavigator(navigatorName:string)

used to set the current active navigator, recommended to use in inside componentDidMount inside the components that renders the navigators
params:
* navigatorName - default: none , description: the name of the navigator to set as active , required: yes

### handleAction(navigatorName:string, action:NavigationActionObject)

used to handle the navigations actions to keep correct navigation state, should be used as seen above
params:
* navigatorName - default: none , description: the name of the navigator to be managed , required: yes
* action - default: none , description: the action triggered , required: yes

### goBack(needAction:boolean)

used to go back on screen, even between nested navigators , also helps keep the correctness of the navigation state
params:
* needAction - default: false , description: should the goBack actually go back or just update the state, true is to dispatch the goBack action , required: no

### navigate(route:{routeName:string,params:object,action:NavigationAction})

used to navigate between screens
params:
* route - default: none , description: the info of the screen we want to navigate to (based on the navigate of react-navigation) , required: yes
    * routeName - default: none , description: the name of the screen to navigate to , required: yes
    * params - default: none , description: the params for the screen , required: no
    * action - default: none , description: the action to be triggered when getting to the screen , required: no

### reset(actions:array, index:number)

used to reset navigation stack , index must be inside the bounds of actions array
params:
* actions - default: none , description: array of NavigationActions to reset stack with , required: yes
* index - default: none , description: the index of the wanted screen after the stack reset , required: yes

### logout()

used to reset all of the navigators in the app to empty stack and initial routes

### doneHydrating(ready:boolean, delay:number)

used to hydrate the store and restore the navigation state
params:
* ready - default: true , description: if this is false the stacks will not be restored just the current route will be set to initial route , required: no
* delay - default: 1500 , description: the delay wanted after restoring all of the stacks before storeHydrated field is set to true , required: no
note that the ready param is not ready for use and should be implemented correctly so it could differ between navigators, right now should use only if the predicate used regards the resoration of all navigators

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

returns the current route and the name of the navigator he is a screen of sperated by a @, for example: 'MainFirst@Main'

### canGoBack

returns a boolean value indicating whether or not it's possible to go back in the navigation

## other functions

### setNavigation(navigatorName:string, ref:navigationReference)

used to set the navigation reference as seen above
params:
* navigatorName - default: none , description: the name of the navigator to be managed , required: yes
* ref - default: none , description: the reference to _navigation of a navigator, required: yes

### getNavigatorStack(navigatorName:string)

used to get the current stack of a navigator by its name
params:
* navigatorName - default: none , description: the name of the navigator that we want to get his current stack , required: yes

### getNavigator(navigatorName:string)

used to get a navigator by its name
params:
* navigatorName - default: none , description: the name of the navigator that we want returned , required: yes
Note that the navigator returned is an instance of the class NavigatorPersist which has the following fields and functions:
* inital fields:
    * navigation = null
    * @persist @observable shouldPersist = true
    * @persist @observable initRoute = null 
    * @persist @observable parent = null 
    * @persist('list', RoutePersist) @observable currentStack = []
    * @persist('object', RoutePersist) @observable currentRoute = null
* functions
    * constructor(shouldPersist:boolean, initRoute:string, parent:string)
    * setNavigation(ref:navigationReference)
    * setInitRoute(routeName:string)
    * setShouldPersist(flag:booolean)
    * setRoute(route:{routeName:string,params:object,action:NavigationAction})
    * getter (used like field) - CurrentRoute , returns a string of the current route routeName
note that these functions are used by the functions of NvaigationStore, but if you want to use them it's possible

## NavigationStore fields - initial

* @observable storeHydrated = false
* @persist('map', NavigatorPersist) @observable navigators = new Map()
* @persist @observable activeNavigator = ''