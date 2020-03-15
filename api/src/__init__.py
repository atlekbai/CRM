from flask import Flask, jsonify


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    @app.route('/')
    def root():
        return jsonify(status=201), 200

    from src.blueprints import countries
    from src.blueprints import person
    app.register_blueprint(countries.BP)
    app.register_blueprint(person.BP)

    return app
