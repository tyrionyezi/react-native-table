import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    Text,
    Animated,
    FlatList,
    ScrollView,
    SectionList,
    Dimensions,
    DeviceEventEmitter
} from 'react-native'
import BlankComponent from '../blankComponent/index.component'; // 无数据时，提示组件

const { height, width } = Dimensions.get('window')

export default class Table extends Component {

    constructor(props) {
        super(props)
        this.state = {
            left_bool: true,
            right_bool: true,
            cellMoreWidth: 0,
        }
        this.width = props.width || 400;
        this.height = props.height || 500;
        this.tSiderWidth = props.tSiderWidth || 150;
        this._theaderHeight = 45;
        this._leftWigth = '20%';
        this._width = 0;
        this.tableHeadBorderColor = '#EEEDED';
        this.tTableFootBg = 'rgba(207, 154, 101, 0.1)',
            this.cellHeight = 44;
        this._dataWidth = 0;
        this.cellPaddingRight = 5;
    }

    // 左上角 表头
    _leftHeader = (title) => {
        return (
            <View style={[styles.container_left, { height: this._theaderHeight, paddingLeft: this.props.paddingLeft || 0 }]}>
                <Text style={[styles.header_title, styles.cellDefault, { textAlign: this.props.leftAlgin || 'center' }]}>{title}</Text>
            </View>
        )
    }

    // 左下角表头
    _leftFooter = (title) => {
        return (
            <View style={[styles.container_left, { height: this.cellHeight, backgroundColor: this.tTableFootBg }]}>
                <Text style={styles.header_title}>{title}</Text>
            </View>
        )
    }


    _leftItem = (item, index) => {
        return (
            <View style={[styles.container_left, { height: this.cellHeight, paddingLeft: this.props.paddingLeft || 0 , backgroundColor: index % 2 == 0 ? 'rgba(207, 154, 101, 0.06)' : '#fff' }]}>
                <Text style={[styles.info, styles.cellDefault, { textAlign: this.props.leftAlgin || 'center' }]}>{item.name}</Text>
            </View>
        )
    }

    getSimpleColumns = (arr = []) => {
        if (arr.length == 0) return;
        arr.map((item, index) => {
            item.hasOwnProperty('children') ?
                this.getSimpleColumns(item.children) :
                this._dataWidth = this._dataWidth + item.width;
        })
    };

    // 计算数据宽度

    calculateDataWidth = (arr = []) => {
        let dataWidth = 0;
        let lgth = arr.length;
        let itemMoreWidth = 0;
        arr.map((item) => {
            dataWidth = dataWidth + Number(item.width);
        })
        if (dataWidth - (this.width - this.tSiderWidth) < 0) {
            itemMoreWidth = (this.width - this.tSiderWidth - dataWidth) / lgth;
        } else {
            itemMoreWidth = 0;
        }
        // console.log(dataWidth, 'dataWidth', this.width, 'this.width', itemMoreWidth, 'itemMoreWidth')
        this.setState({ cellMoreWidth: itemMoreWidth })
    }

    componentWillMount() {
        this._dataWidth = 0;
        this._theaderHeight = this.props.theadheight || 45;
        this.calculateDataWidth(this.props.columns);
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        this._dataWidth = 0;
        this._theaderHeight = nextProps.theadheight || 45;
        this.calculateDataWidth(nextProps.columns);

    }


    _rightHead = (arr = []) => {
        let elements = [];
        let itemElement = null;
        arr.map((item, index) => {
            itemElement = item.hasOwnProperty('children') ?
                <View key={item.dataIndex + index}
                >
                    <View key={item.dataIndex + 't'} style={{
                        height: item.height,
                        borderRightWidth: 1,
                        borderColor: this.tableHeadBorderColor,
                    }}>
                        <Text style={{ textAlign: 'center', lineHeight: item.height }}>{item.title}</Text>
                    </View>
                    <View key={item.dataIndex + 'b'} style={{
                        flexDirection: 'row',
                        borderTopWidth: 1,
                        borderColor: this.tableHeadBorderColor
                    }}>
                        {
                            this._rightHead(item.children)
                        }
                    </View>
                </View>
                :
                <View key={item.dataIndex + index}
                    style={{
                        width: item.width + this.state.cellMoreWidth,
                        height: item.height || this._theaderHeight,
                        borderRightWidth: item.borderWidth,
                        borderColor: this.tableHeadBorderColor,
                        paddingRight: 0,
                    }}>
                    <Text
                        style={{
                            textAlign: 'right',
                            alignItems: 'center',
                            paddingRight: this.cellPaddingRight,
                            lineHeight: item.height || this._theaderHeight
                        }}>
                        {item.title}
                    </Text>
                </View>
            elements.push(itemElement)
        })
        return (<View style={{ flexDirection: 'row', backgroundColor: '#fff' }}>
            {elements}
        </View>
        )
    }


    _rightItem = (columns, item, index) => {
        let elementsArr = [];
        let cellElement = null;
        columns.map((it, idx) => {
            cellElement = it.hasOwnProperty('children') ? 
            this._rightItem(it.children, item, index)
            :
            <View style={{paddingRight: this.props.paddingRight || 0}}>
                <Text
                    key={idx + it.dataIndex}
                    style={{
                        textAlign: 'right',
                        alignItems: 'center',
                        lineHeight: this.cellHeight,
                        height: this.cellHeight,
                        paddingRight: this.cellPaddingRight,
                        width: it.width + this.state.cellMoreWidth,
                    }}>
                    {
                        it.render ? it.render(item[it.dataIndex], index, item) : item[it.dataIndex]
                    }
                </Text>
            </View>
            elementsArr.push(
                cellElement
            )
        });
        return (
            <View style={{
                flexDirection: 'row',
                height: this.cellHeight,
                backgroundColor: index % 2 == 0 ? 'rgba(207, 154, 101, 0.06)' : '#fff',
                }}>
                {elementsArr}
            </View>
        )
    }

    _rightFooter = (data = []) => {
        // console.log(data)
        return (
            <View style={[{ height: this.cellHeight, flexDirection: 'row', backgroundColor: this.tTableFootBg }]}>
                {data.map((item, index) => {
                    return <Text style={{
                        textAlign: 'right',
                        alignItems: 'center',
                        lineHeight: 30,
                        height: this.cellHeight,
                        width: item.width + this.state.cellMoreWidth,
                    }}>{item.dataIndex}</Text>
                })}
            </View>
        )
    }

    render() {
        let { siderTitle, siderData, columns, dataSource } = this.props;
        // console.log(siderTitle, siderData, columns, dataSource, this.height, this.width, '|||||')
        return (
            <View>
                {
                    this.props.dataSource == "" ? <BlankComponent></BlankComponent> :
                        <View style={{ flexDirection: 'row', width: this.width }}>
                            <View style={{ width: this.tSiderWidth, height: this.height - this.cellHeight - 20 }}>
                                <SectionList
                                    ref='left_list'
                                    sections={[{ title: siderTitle, data: siderData }]}
                                    renderItem={({ item, index }) => this._leftItem(item, index)}
                                    renderSectionHeader={({ section }) => this._leftHeader(section.title)}
                                    keyExtractor={(item, index) => index}
                                    bounces={false}
                                    stickySectionHeadersEnabled={true}
                                    onScroll={(e) => { this.state.left_bool ? this._leftOffset(e) : {} }}
                                    onScrollBeginDrag={() => { this._resetState() }}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                            <View style={{ backgroundColor: '#EEEDED', width: 1 }}></View>
                            <View style={{ width: this.width - this.tSiderWidth, height: this.height - this.cellHeight - 20 }}>
                                <ScrollView ref='ScrollViewC' style={{ width: '100%' }} horizontal={true} bounces={false} showsVerticalScrollIndicator={false} onScrollEndDrag={(e) => { this._scrollViewOffsetX(e) }}>
                                    <SectionList
                                        ref='right_list'
                                        style={{ height: '100%' }}
                                        sections={[{ columns: columns, data: dataSource }]}
                                        renderItem={({ item, index }) => this._rightItem(columns, item, index)}
                                        renderSectionHeader={({ section }) => this._rightHead(section.columns)}
                                        keyExtractor={(item, index) => index}
                                        bounces={false}
                                        stickySectionHeadersEnabled={true}
                                        onScroll={(e) => { this.state.right_bool ? this._rightOffset(e) : {} }}
                                        onScrollBeginDrag={() => { this._resetState() }}
                                        showsVerticalScrollIndicator={false}
                                    />
                                </ScrollView>
                            </View>
                        </View>
                }
                <View>

                </View>
            </View>
        )
    }

    _resetState = () => {
        this.setState({
            left_bool: true,
            right_bool: true
        })
    }

    _leftOffset = (e) => {
        let offsetY = e.nativeEvent.contentOffset.y

        this.setState({
            left_bool: true,
            right_bool: false
        })
        this.refs.right_list._wrapperListRef._listRef.scrollToOffset({ offset: offsetY, animated: false })
    }

    _rightOffset = (e) => {
        let offsetY = e.nativeEvent.contentOffset.y

        this.setState({
            left_bool: false,
            right_bool: true
        })
        this.refs.left_list._wrapperListRef._listRef.scrollToOffset({ offset: offsetY, animated: false })
    }

    _scrollViewOffsetX = (e) => {

        if (this.props.type == 0 || this.props.type == 1 || this.props.type == 7) {
            DeviceEventEmitter.emit('offset', { offsetX: e.nativeEvent.contentOffset.x });
        }

    }

}

const styles = StyleSheet.create({
    container_left: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        // paddingLeft: height >= 812 ? 60 : 0
    },
    container_right: {
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center'
    },
    header_title: {
        color: '#CF9A65',
        textAlign: 'center',
        fontSize: 14,
    },
    info: {
        color: 'rgba(0, 0, 0, 0.85)',
        fontSize: 15,
        textAlign: 'center',
    },
    cellDefault: {
        paddingHorizontal: 5,
    }
})