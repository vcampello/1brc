package stats

import (
	"fmt"
	"maps"
	"slices"

	"golang.org/x/text/collate"
	"golang.org/x/text/language"
)

type Aggregator struct {
	Stations map[string]*Station
}

func NewAggregator() *Aggregator {
	return &Aggregator{
		Stations: make(map[string]*Station),
	}
}

func (a *Aggregator) RecordStation(name string, temp float64) {
	station, exists := a.Stations[name]
	if !exists {
		station = NewStation(name, temp)
		a.Stations[name] = station
		return
	}

	station.Update(temp)
}

func (a *Aggregator) SortedNames() []string {
	// required to sort keys correctly - e.g:
	// Zanzibar City=17.1/0.0/17.1
	// Zürich=1.1/2.0/8.6
	// İzmir=-0.4/-0.2/18.9 			<----- this should be first
	c := collate.New(language.Und)
	return slices.SortedFunc(maps.Keys(a.Stations), c.CompareString)
}

func (a *Aggregator) PrintOutput() {
	// This would be much more readable by mapping the joining everything
	// with strings.Join but this avoid the extra allocations.

	fmt.Printf("{ ")
	names := a.SortedNames()
	totalNames := len(names)

	// prevent adding a comma to the last item
	for _, name := range names[:totalNames-1] {
		fmt.Printf("%s, ", a.Stations[name])
	}
	fmt.Printf("%s }\n", a.Stations[names[totalNames-1]])
}
