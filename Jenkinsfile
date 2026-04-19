pipeline {
    agent any

    stages {
        stage('Create Env File') {
            steps {
                sh '''
                echo "MONGO_URI=your_mongo_url" > backend/.env
                echo "PORT=5000" >> backend/.env
                echo "JWT_SECRET=your_secret" >> backend/.env
                '''
            }
        }

        stage('Run App') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up --build -d'
            }
        }
    }
}