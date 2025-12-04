# Toast Notification System

This project uses `react-hot-toast` for displaying toast notifications throughout the application.

## Installation

The toast notification system has already been installed and configured. The required package is:

```bash
npm install react-hot-toast
```

## Setup

The toast system is already set up in the application:

1. The `Toaster` component is added to `src/main.tsx`
2. A custom `useToast` hook is created in `src/hooks/useToast.ts`
3. The hook is integrated into various components

## Usage

To use toast notifications in any component:

1. Import the hook:

```typescript
import { useToast } from "../hooks/useToast";
```

2. Use the hook in your component:

```typescript
const MyComponent = () => {
  const toast = useToast();

  const handleClick = () => {
    toast.success("This is a success message!");
  };

  return <button onClick={handleClick}>Show Toast</button>;
};
```

## Available Methods

The `useToast` hook provides the following methods:

- `toast.success(message: string)` - Shows a success toast
- `toast.error(message: string)` - Shows an error toast
- `toast.warning(message: string)` - Shows a warning toast
- `toast.info(message: string)` - Shows an info toast
- `toast.loading(message: string)` - Shows a loading toast
- `toast.dismiss(toastId?: string)` - Dismisses a toast
- `toast.promise(promise, messages)` - Shows a toast for a promise with loading, success, and error states

## Examples

### Basic Usage

```typescript
const toast = useToast();

// Success message
toast.success("Operation completed successfully!");

// Error message
toast.error("Something went wrong!");

// Warning message
toast.warning("This is a warning!");

// Info message
toast.info("Here's some information");
```

### Promise Toast

```typescript
const toast = useToast();

toast.promise(apiCall(), {
  loading: "Loading...",
  success: "Data loaded successfully!",
  error: "Failed to load data",
});
```

## Components Updated

The following components have been updated to use toast notifications instead of alert() or inline error messages:

1. `ChatPage.tsx` - Replaced alert() calls with toast notifications
2. `LoginPage.tsx` - Replaced inline error messages with toast notifications
3. `SignUpPage.tsx` - Replaced inline error messages with toast notifications
4. `AdminPermissionManager.tsx` - Replaced inline messages with toast notifications
5. `AuthContext.tsx` - Added toast notifications for auth events

## Styling

The toast notifications use the default styling from `react-hot-toast` which fits well with the application's design. The notifications appear at the top-right of the screen and automatically disappear after 5 seconds.
