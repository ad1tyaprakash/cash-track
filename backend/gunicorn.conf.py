bind = "0.0.0.0:5001"bind = "0.0.0.0:5001"

workers = 2workers = 2

worker_class = "sync"worker_class = "sync"

worker_connections = 1000worker_connections = 1000

max_requests = 1000max_requests = 1000

max_requests_jitter = 50max_requests_jitter = 50

timeout = 30timeout = 30

keepalive = 2keepalive = 2

preload_app = Truepreload_app = True