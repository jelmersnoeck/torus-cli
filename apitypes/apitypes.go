// Package apitypes defines types shared between the daemon and its api client.
package apitypes

import (
	"strings"

	"github.com/arigatomachine/cli/identity"
	"github.com/arigatomachine/cli/primitive"
)

// ErrorType represents the string error types that the daemon and registry can
// return.
type ErrorType string

// These are the possible error types.
const (
	BadRequestError     = "bad_request"
	UnauthorizedError   = "unauthorized"
	NotFoundError       = "not_found"
	InternalServerError = "internal_server"
	NotImplementedError = "not_implemented"
)

// Error represents standard formatted API errors from the daemon or registry.
type Error struct {
	StatusCode int

	Type string   `json:"type"`
	Err  []string `json:"error"`
}

// Error implements the error interface for formatted API errors.
func (e *Error) Error() string {
	return e.Type + ": " + strings.Join(e.Err, " ")
}

// Version contains the release version of the daemon.
type Version struct {
	Version string `json:"version"`
}

// SessionStatus contains details about the user's daemon session.
type SessionStatus struct {
	Token      bool `json:"token"`
	Passphrase bool `json:"passphrase"`
}

// Login contains the required details for logging in to the api and daemon.
type Login struct {
	Email      string `json:"email"`
	Passphrase string `json:"passphrase"`
}

// Profile contains the fields in the response for the profiles endpoint
type Profile struct {
	ID   *identity.ID `json:"id"`
	Body *struct {
		Name     string `json:"name"`
		Username string `json:"username"`
	} `json:"body"`
}

// Signup contains information required for registering an account
type Signup struct {
	Name       string
	Username   string
	Email      string
	Passphrase string
	InviteCode string
}

// OrgInvite contains information for sending an Org invite
type OrgInvite struct {
	ID      string               `json:"id"`
	Version int                  `json:"version"`
	Body    *primitive.OrgInvite `json:"body"`
}

// Team contains information for creating a new Team object
type Team struct {
	ID      *identity.ID    `json:"id"`
	Version int             `json:"version"`
	Body    *primitive.Team `json:"body"`
}

// Service contains information for creating a new Service object
type Service struct {
	ID      *identity.ID       `json:"id"`
	Version int                `json:"version"`
	Body    *primitive.Service `json:"body"`
}

// Environment contains information for creating a new Env object
type Environment struct {
	ID      string                 `json:"id"`
	Version int                    `json:"version"`
	Body    *primitive.Environment `json:"body"`
}

// InviteAccept contains data required to accept org invite
type InviteAccept struct {
	Org   string `json:"org"`
	Email string `json:"email"`
	Code  string `json:"code"`
}
