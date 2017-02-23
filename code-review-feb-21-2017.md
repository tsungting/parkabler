## Code Review

The project has the overall Redux framework setup and where the framework is being used it is being used properly, good job!

The biggest problem I see is that some of the organization of responsibility is not placed in the right place.  This can be easily remedied by shuffling the code around so that:

* Component - Display and display logic only
* Store - Storage only
* Action - Asynchronous call and rest of logic

## Actions

### Observation

1. When naming the actions, I notice there are 2 conventions being used:  
    * In SpotsActions the action names stand alone to provide information about what the actions do.  eg `GET_SPOTS`
    * In the rest of actions the action names rely on the class name to provide complete information about the purpose of the action  eg `DestinationActions.SET` 

### Recommendation

1. The most important recommendation here is that the schemes are consistent.  A project should be consistent to reduce unnecessary confusion and complexity.  

2. The project I have worked on use explicit naming so its actions stand alone without additional context from class name.  eg. `DestinationActions.SET_DESTINATION` This is a more flexible convention because it allows us to `SET` different types of things.

## nearbyspots.actions.ts -> getNearbySpots

## Observation

```ts
    if (!destination || !spots) {
        return;
    }
```

## Recommendation 

Validation of input parameters quickly become insane if we have to do it everywhere in the application.  One thing that is useful is to push applicatable validation to the edge of the application as a general rule.  Usually this means http services, and UI.  Once data move past those layers we can assume they are valid.  Moving this validation to the UI it becomes:

```ts
 ngOnInit() {
    this.spotsActions.getSpots();

    // This combines both destination$ & spots$ observables
    // We then use the latest values from both to get nearby spots
    this.destination$.combineLatest(
      this.spots$,
      (destination, spots) => ({destination, spots})
    ).subscribe(({destination, spots}) => {
        if (destination && spots){
            this.nearbySpotsActions.getNearbySpots(destination, spots);
        }
    });
  }
```

## nearbyspots.actions.ts -> getNearbySpots

## Refactoring attempt

```ts
    // get carries the assumption that nearby spots will be returned out of the function
    // Array<Spot> gives more information than a Spots type that is simply a Spot array
    public updateNearbySpots(destination: Position, spots: Array<Spot>) { 

        // This is checked in the component
        /* if (!destination || !spots) {
            return;
        }*/

        this.ngRedux.dispatch({
            type: NearbySpotsActions.UPDATE_GET_SPOTS_STATUS,
            {status: 'IN_PROGRESS'} // Assuming this is for indication async call has started
        });

        const nearbySpots = this.getNearbySpots(destination, spots); // At this level I don't need to know the math or filter method
        if (nearbySpots.length > 0) {
            this.getSpotsWithDistance(nearbySpots, destination) // This function deals with spots, extract distance logic out
                .then( spotsWithDistance => this.dispatchNearbySpots(spotsWithDistance) ) // rename to dispatch function to dispatch
                .catch( err => { throw err; });
        } else {
            this.ngRedux.dispatch({
                type: NearbySpotsActions.UPDATE_GET_SPOTS_STATUS,
                {status: 'NO_DATA'}
            });
        }
    }

    private getSpotsWithDistance(nearbySpots, distances){
        return this.distanceService.getDistance(nearbySpots, destination)
                .then( distances => this.spotsWithDistances(nearbySpots, distances) );
    }

    private getNearbySpots(destination, spots){
        const filteringFunction = this.distanceService.filterByEuclideanDistance(0.2);
        return filteringFunction(destination, spots);
    }
```

## Question places.actions.ts

    What I'm confused about with redux is situations where two things might edit the state. For eg:

    When the user enters a value into places.component, it will set the state.place
    But a different x.component (eg centerOnMe) might need to update state.place
    If that happens, it'll go into a loop:
    x.component sets state.place
    places.component listens to the change on state.place
    places.component updates and sets state.place
        

## Answer

In this case you can add the [distinctUntilChanged](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/distinctuntilchanged.md) operator onto the observable.  This will change the observable so it doesn't fire unless the emitted data is different.

Since your loop will end up firing the same event over and over, this can stop that and break the loop.


## Service

## distance.service.ts -> getDistance

## Observation

A promise is created and `resolved` and `rejected` based on the status of the callback function.  

## Recommendation

Even tho this may work, your maintainers will wonder why some async operations are done through `observables` and some are done through `promises`

Since we are using observables with `stores` and angular2's `http`, we should use `observables` to handle our async calls unless there is a very good reason to use `promise`. 

## Observation

Various states are being kept in the services such as editspotstate.service.ts, and geolocation.service.ts.  

## Recommendation

Generally services don't have internal or external states (no service level variables).  The services fetch information from http or google geolocation services then return that out.

Actions (not components) call the services and in the async return function call dispatch the action event.

Stores listen to the action event and keep the states that are currently kept in the services.  

Components subscribe to the store and reacts to the application state change.

The advantage of separating responsibilities this way is to simplify the way we think about the application.  We no longer need to think of the data, logic, and UI as a whole.  Instead we can implement each component independent of each other.  We can write smaller, better, more flexible components and when we wire them up together they should just work.

## maplocation.service.ts 

## Observation 

This service is no longer used by the application as we discussed in email, however it is still being called by components.

## Recommendation

Being a sole contributer on the project this may seem as less of a problem.  In general it is good practice for code that is no longer required to be deleted before we commit it to github.  The reasoning here is the code on github should be considered 'production ready' as much as possible, and it will be read and commented on by other developers.  Having unused code provides unnecessary confusion.

## Question app.module.ts

TODO-rangle: is there a good way to break this file up? it's really long 

## Answer

The way to break it up is to create feature modules and include it into the root module through imports, similar to MaterialModule.  In general tho it is okay for this file to be long because it's not meant to be read or understood in a sequential manner.  It is simply a declaration file of different parts of the application to be dependency injected by angular2.

## Question

TODO-rangle: No one other than map cares about these components,
yet I need to declare it in app.module
Is there a better way to do this?

## Answer

If you want to encapsulate the functionality of map components you can delcare the group as a custom angular2 module then import that module into the app.module.  This way you don't need to declare it in the app.module instead you declare it in the child module.

## Question

TODO-rangle: would it be better to get this from global state?

## Answer

It seems like ultimately you want to setDestination from the result of the currentLocation service.  In this case I would recommend have the action call this.geoLocation.currentLocation, then have the action listen to the promise and continue to call the logic in destinationActions.setDestination.

Keep in mind the responsibilities are:

Component - Display and display logic only
Store - Storage only
Action - Asynchronous call and rest of logic

## Question

TODO-rangle: Why do I have to inject http explicitly?  The httpmodule is included in app.module

## Answer

You shouldn't have to inject explicitly, you need to tell angular2 that the Http is required for this service so the service can be instantiated with Http, and have a reference to the http service.  The code should work like this:

```ts
  constructor(
        private http: Http
    ) {}
```

Also you have some syntax errors in the class decorator, change it to

```ts
@Injectable() // use '@' symbol and remove semi-colon
export class PlacesService {
```

## Question

TODO-rangle: Why does Http return an observable strem? do we care about anything other than the first result?

## Answer

Observables are seen as the next iteration of how to handle asynchonrous calls.  Even tho the stream actually completes after 1 result we still use Observable stream instead of Promises.  With observable stream we get more operators and it allow us to merge with other streams (such as the store stream) easier.  

## Question

TODO hydrate this initial state from localstorage
TODO-rangle: how do I do that?

## Answer

In your `store/index.ts` add 

```ts
export let enhancers = [persistState()];
```

Don't forget to require

```ts
const persistState = require('redux-localstorage'); //Didn't require before
```

You already require the library and have commented out code indicating experimentation.  If you put the code I provided the enhancer will save your state information under localStorage.redux.  It will also load it from there on app start

## Question

TODO-rangle: how do I secure this?

## Answer

Typically you would want this information to come outside of your codebase and get loaded in at runtime.  These are some common places we find them:

1.  Loaded in from an external database the program signs in to
1.  Stored on a server that the application can get from a http call.
1.  Saved as an environment variable that the application can access at runtime.