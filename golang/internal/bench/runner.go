package bench

import (
	"time"
)

func Run[T any](fn func() T) (T, time.Duration) {
	start := time.Now()
	result := fn()

	return result, time.Since(start)
}

func RunVoid(fn func()) time.Duration {
	start := time.Now()
	fn()

	return time.Since(start)
}
