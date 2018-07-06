import React from 'react';
import {BackTop, Row, Col, Menu, Icon, Divider} from 'antd';
import PropTypes from 'prop-types';
import Layout from './layout';
import locales from './locales';
import components from './componentsPage';
import {getPlainComponentList} from './utils';

const SubMenu = Menu.SubMenu;

export default class Components extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    params: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.plainComponentList = getPlainComponentList();
    this.state = {
      page: ''
    };
  }

  componentWillMount() {
    window.addEventListener("hashchange", this.setComponentShow, false);
  }

  componentDidMount() {
    this.setPage();
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.setComponentShow, false);
  }

  setComponentShow = () => {
    window.scrollTo(0, 0);

    this.setPage();
  };

  getLocale(key) {
    const map = locales['zh-CN'] || {};
    return key.split('.').reduce((a, b) => {
      const parent = map[a];

      if (b) {
        return (parent || {})[b];
      }

      return parent;
    });
  }

  getPage() {
    return this.props.params.demo || this.plainComponentList[0].key;
  }

  setPage(fn) {
    this.setState({page: this.getPage()}, fn);
  }

  render() {
    const componentIndex = this.plainComponentList.findIndex((menuItem) => menuItem.key === this.state.page);
    const lastLink = this.plainComponentList[componentIndex - 1];
    const nextLink = this.plainComponentList[componentIndex + 1];
    const Navigation = (
      <div>
        <Divider/>
        <Row className="u-navigation-btm">
          <Col span={12} className="prev-page">
            {lastLink && <a href={lastLink.url}><Icon type="left" className="prev-page-icon"/>{lastLink.value.name}</a>}
          </Col>
          <Col span={12} className="next-page">
            {nextLink &&
            <a href={nextLink.url}>{nextLink.value.name}<Icon type="right" className="next-page-icon"/></a>}
          </Col>
        </Row>
      </div>
    );
    return (
      <Layout className="doc">
        <Row>
          <Col xs={24} sm={24} md={24} lg={6} xl={5} xxl={4}>
            <nav className="side-nav">
              <Menu
                selectedKeys={[this.state.page]}
                defaultOpenKeys={[this.getLocale('misc.development'), this.getLocale('misc.components'), this.getLocale('misc.patterns')]}
                mode="inline"
              >
                <SubMenu key={this.getLocale('misc.development')} title={this.getLocale('misc.development')}>
                  {
                    Object.keys(components.documents).map(page => {
                      return (
                        <Menu.Item key={page}>
                          <a href={`#/components/${page}`}>{components.documents[page].name}</a>
                        </Menu.Item>
                      );
                    })
                  }
                </SubMenu>
                <SubMenu key={this.getLocale('misc.components')} title={this.getLocale('misc.components')}>
                  {
                    Object.keys(components.list).map(group => {
                      return (
                        <Menu.ItemGroup key={group} title={group} disabled={false}>
                          {
                            Object.keys(components.list[group]).map(page => {
                              return (
                                <Menu.Item key={page}>
                                  <a href={`#/components/${page}`}>{components.list[group][page].name}</a>
                                </Menu.Item>
                              );
                            })
                          }
                        </Menu.ItemGroup>
                      );
                    })
                  }
                </SubMenu>
                <SubMenu key={this.getLocale('misc.patterns')} title={this.getLocale('misc.patterns')}>
                  {
                    Object.keys(components.patterns).map(group => {
                      return (
                        <Menu.ItemGroup key={group} title={group} disabled={false}>
                          {
                            Object.keys(components.patterns[group]).map(page => {
                              return (
                                <Menu.Item key={page}>
                                  <a href={`#/components/${page}`}>{components.patterns[group][page].name}</a>
                                </Menu.Item>
                              );
                            })
                          }
                        </Menu.ItemGroup>
                      );
                    })
                  }
                </SubMenu>
              </Menu>
            </nav>
          </Col>
          <Col xs={24} sm={24} md={24} lg={18} xl={19} xxl={20}>
            <div className="content">
              <article className="markdown">
                {this.props.children}
              </article>
              {Navigation}
              <BackTop>
                <img src={require('./assets/nppd-web-1.51-but@2x.png')} className="u-backtop" alt="backTop"/>
              </BackTop>
            </div>
          </Col>
        </Row>
      </Layout>
    );
  }
}