# mobx-react-navigation-store

mobx navigation store for nested navigators using react navigation, including persist when needed

## Welcome

This project is still under construction and will be improved further
if you want to contribute you can
* see the Contributing section and then you can
    * open issues with ideas for improvments 
    * help with documantion 
    * PRs

of course you don't have to contribute to enjoy this package, so enjoy!

## Why?

while working with react native I found that I need to use quite often with nested navigators and keeping the navigation state when the user closes the app.
after many times implementing an app specific navigation store using mobx, so this project aspires to be a generic navigation state mangment store which supports navigation presisitence.

## Working example
you can check out the very simple react native example app
just click [here](https://github.com/himelbrand/mobx-react-navigation-store/tree/master/ReactNativeExample) and follow the instructions
enjoy!
## What's ready?

* stack navigators - partial support
    * nested stack navigators - V
    * with persistence - V
    * without persistence - V
    * navigation actions supported : navigate, reset, goBack
    * navigation actions support still missing : replace, push, pop, popToTop
* drawer navigators - no support yet :(
* tab navigators - no support yet :(

## Installation

```bash
yarn add mobx-react-navigation-store
# or with npm 
# npm install mobx-react-navigation-store --save
```
npm page - https://www.npmjs.com/package/mobx-react-navigation-store

This project depends on other project so if you're using any of the following packages:
 
* mobx
* mobx-persist
* mobx-react
* react-navigation

Note that this packages are installed automatically when installing mobx-react-navigation-store with the following versions:

* "mobx": "^3.4.1",
* "mobx-persist": "^0.4.1",
* "mobx-react": "^4.4.1",
* "react-navigation": "^1.0.0-beta.29"

## Usage

Note that more info on the specific methods and fields will be added later in another section 
this is just general usage instructions

### import

this package exports a singelton so every where you import will have the same data inside
```javascript
import NavigationStore from 'mobx-react-navigation-store'
```

### hydrate store and set navigators

the hydration should happen in the component that renders the main navigator
this code is from the react native example app, so assume usage of three navigators called: Main,NavOne,NavTwo
where Main is the parent of NavOne and NavOne is the parent of NavTwo and NavTwo is not persistent.
you must remember to also import create from mobx-persist like so:
```javascript
import { create } from 'mobx-persist'
const hydrate = create({
    storage: AsyncStorage //this is since I'm using react native
})
```
```javascript
    componentWillMount() {
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
```

### setting navigation ref and handling actions

in every component that renders a navigator the following must be done inside the render function, here Main is the navigator being rendered:
```javascript 
    <Main
        ref={ref => {
                if (ref &&  (!NavigationStore.getNavigator('Main').navigation || this.state.nowMounted)) {
                    this.setState({ nowMounted: false }) // in componentDidMount => this.setState({ nowMounted: true })
                    try {
                        NavigationStore.setNavigation('Main', ref._navigation)
                    } catch (err) {
                        console.log(err)
                    }
                }}}
        onNavigationStateChange={(oldState, newState, action) => {
                try {
                    NavigationStore.handleAction('Main', action)
                } catch (err) {
                    console.log(err)
                }}}
    /> 
```
this will ensure that all of the actions are handled by the store and that the methods for navigation in the package will work on this navigator

### example stack navigator

right now in order to make a screen marked as a nested navigator you must give it a name including the string: 'NestedNavigator' 
it can be anything including this string for example : 'NestedNavigator1' or 'NestedNavigator_Chat' or 'NestedNavigatorOne' etc.
```javascript
const Main = StackNavigator(
    {
        MainFirst: { screen: ScreenOne },
        MainSecond: { screen: ScreenTwo },
        MainThird: { screen: ScreenThree },
        NestedNavigator: { screen: NavigatorOne },
    }, {
        headerMode: 'none',
        lazy: true,
        initialRouteName: 'MainFirst',
    }
)
```

### passing the navigator store via mobx provider

Although as mentioned above, you can just import the navigation store at any screen and it will stay concurrent, you can also pass it via props or via the mobx provider
like so:
```javascript 
import { Provider } from 'mobx-react/native'
const stores = { NavigationStore /*add any other stores you want to provide*/ } //assuming you imported NavigationStore
```
this is inside the render function of the component and as you can see inside the provider is the main navigator and now all of his screens and nested navigators will recieve NavigationStore as a prop
```javascript
<Provider {...stores}> 
    <Main
        ref={ref => {
                if (ref &&  (!NavigationStore.getNavigator('Main').navigation || this.state.nowMounted)) {
                    this.setState({ nowMounted: false }) // in componentDidMount => this.setState({ nowMounted: true })
                    try {
                        NavigationStore.setNavigation('Main', ref._navigation)
                    } catch (err) {
                        console.log(err)
                    }
                }}}
        onNavigationStateChange={(oldState, newState, action) => {
                try {
                    NavigationStore.handleAction('Main', action)
                } catch (err) {
                    console.log(err)
                }}}
    /> 
</Provider>
```
notice that in order to react to changes in observables you need the component getting the store to be an observer

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

## Contributing

Please read [CONTRIBUTING.md](https://github.com/himelbrand/mobx-react-navigation-store/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 
## License
This project is licensed under the MIT License

## Acknowledgments

this package uses the packages mentioned above, which are great packages that are open source 
for more info on these packages and how to use them so you can make greater benefit of this package use the links below:
* [mobx - getting started](https://mobx.js.org/getting-started.html)
* [mobx - repo](https://github.com/mobxjs/mobx)
* [mobx-persist - repo](https://github.com/pinqy520/mobx-persist)
* [react-navigation - repo](https://github.com/react-navigation/react-navigation)
* [react-navigation - docs](https://reactnavigation.org/docs/getting-started.html)

Big thanks to all the people responsible for these projects
 