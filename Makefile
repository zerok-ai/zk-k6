build:
	./scripts/gcp-artifact-deploy.sh

deploy:
	./scripts/deploy.sh

bdeploy:
	./scripts/gcp-artifact-deploy.sh && ./scripts/deploy.sh

restart
	kubectl delete pods -l app=k6-load-generator -n k6

brestart:
	./scripts/gcp-artifact-deploy.sh && kubectl delete pods -l app=k6-load-generator -n k6