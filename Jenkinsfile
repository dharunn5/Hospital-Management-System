pipeline {
    agent any

    stages {
        stage('Run App') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up --build -d'
            }
        }
    }
}