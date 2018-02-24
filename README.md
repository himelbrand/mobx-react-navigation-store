![text](https://preview.ibb.co/cidW5x/imageedit_3_3248511135.png)

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
just click [here](https://github.com/himelbrand/rn-navigation-store/tree/master/ReactNativeExample) and follow the instructions
enjoy!

## What's ready?

* stack navigators - has support
    * navigation actions support still missing : replace, push, pop, popToTop
* drawer navigators - has support
* tab navigators - has support
    * no lazy load - WIP

## Installation

```bash
yarn add rn-navigation-store
```
or with npm 
```bash
npm install rn-navigation-store --save
```
npm page - https://www.npmjs.com/package/rn-navigation-store

old npm page - https://www.npmjs.com/package/mobx-react-navigation-store

This project depends on other project so if you're using any of the following packages:
* mobx
* mobx-persist
* mobx-react
* react-navigation

Note that this packages are installed automatically when installing rn-navigation-store with the following versions:

* "mobx": "^3.4.1",
* "mobx-persist": "^0.4.1",
* "mobx-react": "^4.4.1",
* "react-navigation": "^1.1.2"

## Usage

Note that more info on the specific methods and fields will be added later in another section 
this is just general usage instructions

to see full docs [press here](https://github.com/himelbrand/rn-navigation-store/blob/master/DOCS.md)

### import

this package exports a singelton so every where you import will have the same data inside
```javascript
import NavigationStore from 'rn-navigation-store'
```

to import navigators , you should use these insted of the ones in 'react-navigation'
these navigators wrap the react-navigation navigators to work with the store

```javascript
import { DrawerNavigator, StackNavigator, TabNavigator  } from 'rn-navigation-store'
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
             NavigationStore.setNavigators({
                MainDrawer: {
                    type: 'drawer', //default value : 'stack'
                    initRoute:'Home' //required
                    nested: { NestedNavigatorTabs: 'MainTabs' }, //default value : null
                    parent: null, //default value : null
                    shouldPersist: true, //default value : true
                    routes:null //default value : null
                },
                MainTabs: {
                    type: 'tab',
                    initRoute:'Home'
                    parent: 'MainDrawer',
                    nested: { NestedNavigatorMain: 'Main' },
                    shouldPersist: true,
                    routes: ['Home', 'Two', 'NestedNavigatorMain'],
                },
                Main: {
                    type: 'stack',
                    nested: { NestedNavigator: 'NavOne' },
                    parent: 'MainTabs',
                    initRoute:'MainFirst'
                },
                NavOne: {
                    type: 'stack',
                    parent: 'Main',
                    nested: { NestedNavigator: 'NavTwo' },
                    initRoute:'NavOneFirst'
                },
                NavTwo: {
                    type: 'tab',
                    parent: 'NavOne',
                    routes: ['NavTwoFirst', 'NavTwoSecond'],
                    initRoute:'NavTwoFirst'
                }
            },{
                initialNavigatorName: 'MainDrawer',//the initial navigator name, required
                order:['MainDrawer', 'MainTabs', 'Main', 'NavOne', 'NavTwo']//order of nesting of navigators, required
            })
            setTimeout(() => NavigationStore.doneHydrating(), 1000)
            NavigationStore.StartedStoreHydration()
        }).catch(error => console.log(error))
    }
```

### example stack navigator

right now in order to make a screen marked as a nested navigator you must give it a name including the string: 'NestedNavigator' 
it can be anything including this string for example : 'NestedNavigator1' or 'NestedNavigator_Chat' or 'NestedNavigatorOne' etc.
```javascript
import { StackNavigator } from 'rn-navigation-store'

const Main = StackNavigator(
    'Main',
    {
        MainFirst: { screen: ScreenOne },
        MainSecond: { screen: ScreenTwo },
        MainThird: { screen: ScreenThree },
        NestedNavigator: { screen: NavigatorOne },
    }, {
        headerMode: 'none',
        initialRouteName: 'MainFirst',
    }
)
```

then inside render function , where needed
```javascript
render(){
    /*render code*/
    <Main screenProps={/* this prop will get passed to the screen components as this.props.screenProps */}/>
    /*render code*/
}
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
    <Main /> 
</Provider>
```
notice that in order to react to changes in observables you need the component getting the store to be an observer, and have @inject('NavigationStore')

## Contributing

Please read [CONTRIBUTING.md](https://github.com/himelbrand/rn-navigation-store/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

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
 
