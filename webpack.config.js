const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const cssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const terserWebpackPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const nodeExternals = require('webpack-node-externals');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = `[name]${isProd ? '.[contenthash]' : ''}`;
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    };

    if (isProd) {
        config.minimizer = [
            new cssMinimizerWebpackPlugin(),
            new terserWebpackPlugin()
        ];
    }

    return config;
};
const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'favicon.png',
                    to: ''
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename + '.css'
        })
    ];

    if (isProd) base.push(new BundleAnalyzerPlugin());

    return base;
};

const frontend = {
    context: path.resolve(__dirname, 'src/frontend'),
    mode: 'development',
    // entry: ['@babel/polyfill', './scripts/index.ts'],
    entry: './scripts/index.ts',
    output: {
        filename: filename + '.js',
        path: path.resolve(__dirname, 'dist/frontend')
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.(png|ttf)/,
                type: 'asset/resource'
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.s[ac]ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            // {
            //     test: /\.js$/,
            //     exclude: path.resolve(__dirname, 'node_modules'),
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: [
            //                 '@babel/preset-env'
            //             ],
            //             plugins: [
            //                 '@babel/plugin-proposal-class-properties'
            //             ]
            //         }
            //     }
            // },
            {
                test: /\.tsx?$/,
                exclude: path.resolve(__dirname, 'node_modules'),
                use: 'ts-loader'
            }
        ]
    }
};

const backend = {
    context: path.resolve(__dirname, 'src/server'),
    mode: 'development',
    entry: './server.ts',
    output: {
        filename: filename + '.js',
        path: path.resolve(__dirname, 'dist/server')
    },
    resolve: {
        extensions: ['.js', '.json', '.ts'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'CurrentPlayers.json',
                    to: ''
                }
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: path.resolve(__dirname, 'node_modules'),
                use: 'ts-loader'
            }
        ]
    },
    target: 'node',
    externals: [nodeExternals()] // specify for example node_modules to be not bundled
};

module.exports = [
    Object.assign({}, frontend), 
    Object.assign({}, backend)
];
