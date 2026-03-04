package stats

import "fmt"

type Station struct {
	Name  string
	Count uint64
	Min   float64
	Max   float64
	Sum   float64
}

func NewStation(name string, temp float64) *Station {
	return &Station{
		Name:  name,
		Min:   temp,
		Max:   temp,
		Count: 1,
		Sum:   0,
	}
}

func (s *Station) String() string {
	return fmt.Sprintf("%s=%.1f/%.1f/%.1f", s.Name, s.Min, s.Sum/float64(s.Count), s.Max)
}

func (s *Station) Update(temp float64) {
	if temp > s.Max {
		s.Max = temp
	} else if temp < s.Min {
		s.Min = temp
	}

	s.Count += 1
	s.Sum += temp
}
